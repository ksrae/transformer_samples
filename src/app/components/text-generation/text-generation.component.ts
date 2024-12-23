import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-text-generation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './text-generation.component.html',
  styleUrl: './text-generation.component.scss'
})
export class TextgenerationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal([] as any);
  textForm = new FormControl('Once upon a time, there was');


  ngAfterViewInit() {
    this.textForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/text-generation.worker', import.meta.url), {
      type: 'module'
    });

    this.workerMessage();
  }

  workerMessage() {
    if(!this.worker) return;

    this.worker.onmessage = (event) => {
      this.loading.set(false);
      this.stopTimer();

      const buffer = event.data;
      const result = this.arrayBufferToObject(buffer);
      const { type, output, error } = result;

      if (type === 'SUCCESS') {
        this.successResult(output);
      } else if (type === 'ERROR') {
        console.error('Worker error:', error);
      }
    };
  }

  successResult(output: any) {
    console.log({output});
    this.output.set(output);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set([]);
    this.startTimer(); // 시작 시간 기록

    const text = `${this.textForm.value}.`;

    const message = {
      text,
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }

}

