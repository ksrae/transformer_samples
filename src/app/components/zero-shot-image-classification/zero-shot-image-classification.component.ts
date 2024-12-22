import { CommonModule } from '@angular/common';
import { Component, signal, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-zero-shot-image-classification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './zero-shot-image-classification.component.html',
  styleUrls: ['./zero-shot-image-classification.component.scss'],
})
export class ZeroShotImageClassificationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal([] as any[]);
  score = signal(0);
  imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/tiger.jpg');
  labels = signal(['tiger', 'horse', 'dog']);

  ngAfterViewInit() {
    this.worker = new Worker(new URL('../../workers/zero-shot-image-classification.worker', import.meta.url), {
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
    console.log('output:', output);

    this.output.set(output);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set([] as any[]);
    this.startTimer(); // 시작 시간 기록

    const message = {
      value: this.imageUrl(),
      label: this.labels(),
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }
}

