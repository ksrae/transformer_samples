import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-classification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './classification.component.html',
  styleUrl: './classification.component.scss'
})
export class ClassificationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal([] as any[]);
  originTextForm = new FormControl('I like you');
  sourceTypeForm = new FormControl('positive');

  ngAfterViewInit() {
    this.originTextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/classification.worker', import.meta.url), { type: 'module' });
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
    console.log('output:', output);

    this.output.set(output);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set([]);
    this.startTimer();

    const text = this.originTextForm.value ?? '';
    const message = {
      text,
      modelType: this.sourceTypeForm.value
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }


}
