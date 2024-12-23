import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';


@Component({
  selector: 'app-text-to-audio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './text-to-audio.component.html',
  styleUrl: './text-to-audio.component.scss'
})
export class TextToAudioComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal('');
  maskForm = new FormControl('Hello, my dog is cute');

  ngAfterViewInit() {
    this.maskForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/text-to-audio.worker', import.meta.url), {
      type: 'module'
    });

    this.workerMessage();
  }

  workerMessage() {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      this.loading.set(false);
      this.stopTimer();

      // Decode ArrayBuffer response
      const buffer = event.data;
      const decoder = new TextDecoder();
      const result = JSON.parse(decoder.decode(new Uint8Array(buffer)));

      const { type, output, error } = result;

      if (type === 'SUCCESS') {
        // Reconstruct Float32Array from plain array
        const audio = new Float32Array(output.audio);
        const sampling_rate = output.sampling_rate;

        // Pass to successResult
        this.successResult({ audio, sampling_rate });
      } else if (type === 'ERROR') {
        console.error('Worker error:', error);
      }
    };
  }


  successResult(output: any) {
    const { audio, sampling_rate } = output;

    // Convert Float32Array to WAV
    const wavBuffer = this.float32ToWav(audio, sampling_rate);

    // Create Blob and Object URL
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(blob);

    // Set output to audio URL
    this.output.set(audioUrl);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set('');
    this.startTimer(); // 시작 시간 기록

    const text = `${this.maskForm.value}`;

    const message = {
      text,
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }
}

