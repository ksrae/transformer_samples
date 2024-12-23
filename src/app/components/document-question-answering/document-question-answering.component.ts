import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-document-question-answering',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './document-question-answering.component.html',
  styleUrl: './document-question-answering.component.scss'
})
export class DocumentQuestionAnsweringComponent extends CommonDirective implements AfterViewInit {
  questionForm = new FormControl('What is the invoice number?');

  output = signal('');
  loading = signal(false);
  error = signal('');
  imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/invoice.png');

  ngAfterViewInit() {
    this.questionForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/document-question-answering.worker', import.meta.url), {
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
    this.output.set((output[0] as any).answer);
  }

  async answer() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);

    this.startTimer(); // 시작 시간 기록


    const message = {
      imageUrl: this.imageUrl(),
      question: this.questionForm.value
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }
}
