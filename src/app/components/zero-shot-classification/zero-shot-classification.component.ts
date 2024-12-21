import { CommonModule } from '@angular/common';
import { Component, signal, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-zero-shot-classification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './zero-shot-classification.component.html',
  styleUrls: ['./zero-shot-classification.component.scss'],
})
export class ZeroShotClassificationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(true);
  output = signal('');
  score = signal(0);
  textForm = new FormControl('');

  ngAfterViewInit() {
    this.textForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/zero-shot-classification.worker', import.meta.url), {
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
    // this.output.set(output[0].generated_text);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set("");
    this.startTimer(); // 시작 시간 기록


    const text = `${this.textForm.value}`;
    // return await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
    const labels = [ 'mobile', 'billing', 'website', 'account access' ];

    // return await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-xsmall');
    // const labels = [ 'urgent', 'not urgent', 'phone', 'tablet', 'computer' ];

    const message = {
      text,
      labels,
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }
}

