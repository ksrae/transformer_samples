import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-text2text-generation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './text2text-generation.component.html',
  styleUrl: './text2text-generation.component.scss'
})
export class Text2textgenerationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(true);
  output = signal('');
  textForm = new FormControl('');


  ngAfterViewInit() {
    this.textForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/text2text-generation.worker', import.meta.url), {
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
    this.output.set(output[0].generated_text);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set('');
    this.startTimer(); // 시작 시간 기록

    const text = `${this.textForm.value}`;

    this.worker.postMessage({
      text,
    });

  }

}

