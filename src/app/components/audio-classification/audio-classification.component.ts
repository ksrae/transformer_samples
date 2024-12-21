import { CommonDirective } from './../../directives/common.directive';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';

@Component({
  selector: 'app-audio-classification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './audio-classification.component.html',
  styleUrl: './audio-classification.component.scss'
})
export class AudioClassificationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal('');
  score = signal(0);
  originTextForm = new FormControl({value:'Do not input any text here during demo.', disabled: true});
  sourceTypeForm = new FormControl('gender'); // gender, finetune


  ngAfterViewInit() {
    this.originTextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/audio-classification.worker', import.meta.url), {
      type: 'module'
    });

    this.workerMessage();
  }

  workerMessage() {
    if(!this.worker) return;

    this.worker.onmessage = (event) => {
      this.loading.set(false);
      this.stopTimer();

      const { type, output, error } = event.data;
      if (type === 'SUCCESS') {
        this.successResult(output);
      } else if (type === 'ERROR') {
        console.error('Worker error:', error);
      }
    };
  }

  successResult(output: any) {
    const highestItem = output.length && output.length === 1 ? output[0] : output.sort((a: any, b: any) => b.score - a.score)[0];

    this.output.set(highestItem.label);
    this.score.set(highestItem.score * 100);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set('');
    this.score.set(0);
    this.startTimer(); // 시작 시간 기록

    const text = this.originTextForm.value ?? '';

    this.worker.postMessage({
      text,
      modelType: this.sourceTypeForm.value
    });

  }
}
