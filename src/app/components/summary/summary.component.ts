import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal('');
  originTextForm = new FormControl('It’s super simple to translate from existing code! Just like the python library, we support the pipeline API. Pipelines group together a pretrained model with preprocessing of inputs and postprocessing of outputs, making it the easiest way to run models with the library.');

  ngAfterViewInit() {
    // this.setSummaryPipeline();

    this.originTextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/summary.worker', import.meta.url), {
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
    this.output.set((output[0] as any).summary_text);
  }

  async generateSummary() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set('');
    this.startTimer(); // 시작 시간 기록

    const text = `${this.originTextForm.value}`;

    const message = {
      text,
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }

}

