import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-image-to-image',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './image-to-image.component.html',
  styleUrl: './image-to-image.component.scss'
})
export class ImageToImageComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal('');
  imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/butterfly.jpg');
  resultViewer = signal(false);

  ngAfterViewInit() {
    this.worker = new Worker(new URL('../../workers/image-to-image.worker', import.meta.url), { type: 'module' });
    this.workerMessage();
  }

  workerMessage() {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      this.loading.set(false);
      this.stopTimer();

      // Receive ArrayBuffer and convert back to object
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
    this.resultViewer.set(true);
    // 받은 데이터를 다시 Uint8Array로 변환
    const uint8Array = new Uint8Array(output.data);
    const { width, height, channels } = output;
    console.log('output', output, { uint8Array });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ImageData 생성
    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < height * width; i++) {
        imageData.data[i * 4] = uint8Array[i * channels];     // R
        imageData.data[i * 4 + 1] = uint8Array[i * channels + 1]; // G
        imageData.data[i * 4 + 2] = uint8Array[i * channels + 2]; // B
        imageData.data[i * 4 + 3] = 255;                          // A
    }

    ctx.putImageData(imageData, 0, 0);

    // Canvas를 Blob으로 변환하고 URL 생성
    canvas.toBlob((blob) => {
        if (blob) {
            const url = URL.createObjectURL(blob);
            this.output.set(url);
        }
    }, 'image/png');

    const container = document.querySelector('#output-div');
    // 캔버스를 DOM에 추가 (옵션)
    container?.appendChild(canvas);
}


  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set('');
    this.resultViewer.set(false);
    this.startTimer();

    const value = this.imageUrl();
    const message = {
      value,
    };

    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }
}
