import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';
import { TensorVisualizerComponent } from '../../directives/tensor-visualizer.component';

@Component({
  selector: 'app-feature-extraction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TensorVisualizerComponent],
  templateUrl: './feature-extraction.component.html',
  styleUrl: './feature-extraction.component.scss'
})
export class FeatureExtractionComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  result = signal(false);
  output = signal({data: [] as any, dims: [] as any});
  originTextForm = new FormControl('This is a simple test.');

  ngAfterViewInit() {
    this.originTextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/feature-extraction.worker', import.meta.url), { type: 'module' });
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
    this.result.set(true);
    const { ort_tensor } = output;
    const { cpuData, dims } = ort_tensor;

    // Convert cpuData object to Float32Array
    const tensorData = new Float32Array(Object.values(cpuData));

    // Update the signals
    this.output.set({ data: tensorData, dims });
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.result.set(false);
    this.output.set({data: [], dims: []});
    this.startTimer();

    const text = this.originTextForm.value ?? '';
    const message = {
      text,
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }


}
