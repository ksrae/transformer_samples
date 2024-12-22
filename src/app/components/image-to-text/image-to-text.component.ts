import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-image-to-text',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './image-to-text.component.html',
  styleUrl: './image-to-text.component.scss'
})
export class ImageToTextComponent extends CommonDirective implements AfterViewInit {
  // sourceTextForm = new FormControl('');
  sourceForm = new FormControl('caption');

  output = signal('');
  loading = signal(false);
  error = signal('');
  imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg');

  ngAfterViewInit() {
    this.sourceForm.valueChanges.pipe(
      tap(value => {
        if(value === 'caption') {
          this.imageUrl.set('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg');
        } else if(value === 'ocr') {
          this.imageUrl.set('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/handwriting.jpg');
        }
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/image-to-text.worker', import.meta.url), {
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
    this.output.set((output[0] as any).generated_text);
  }

  async translate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);

    this.startTimer(); // 시작 시간 기록




    const message = {
      imageUrl: this.imageUrl(),
      type: this.sourceForm.value
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }
}
