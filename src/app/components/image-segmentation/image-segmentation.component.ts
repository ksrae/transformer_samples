import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-image-segmentation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './image-segmentation.component.html',
  styleUrl: './image-segmentation.component.scss'
})
export class ImageSegmentationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal([] as any[]);
  score = signal(0);
  imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg');

  ngAfterViewInit() {


    this.worker = new Worker(new URL('../../workers/image-segmentation.worker', import.meta.url), { type: 'module' });
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

  successResult(output: any[]) {
    console.log('output:', output);

    this.output.set(output);

    // const highestItem = output.length === 1 ? output[0] : output.sort((a: any, b: any) => b.score - a.score)[0];
    // this.output.set(highestItem.label);
    // this.score.set(highestItem.score * 100);
    // console.log('mask:', highestItem.mask);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set([]);
    this.score.set(0);
    this.startTimer();

    const value = this.imageUrl();
    const message = {
      value,
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }


}
