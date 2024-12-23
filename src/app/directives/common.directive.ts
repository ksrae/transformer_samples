import { DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { WorkerLoaderService } from '../services/worker-loader.service';

@Directive({
  selector: '[common]',
  standalone: true
})
export class CommonDirective implements OnInit {
  destroyRef = inject(DestroyRef);
  workerLoaderService = inject(WorkerLoaderService);
  worker: Worker | null = null;

  private elapsedTimeWorker!: Worker | null;
  private elapsedTimeWorkerBlobUrl!: string;
  elapsedTime = signal(0);

  ngOnInit(): void {
    // 워커 초기화
    this.setElapsedTimeWorker();

    this.destroyRef.onDestroy(() => {
      // Worker 종료
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }

      if (this.elapsedTimeWorker) {
        this.elapsedTimeWorker.postMessage({ command: 'stop' });
        this.elapsedTimeWorker.terminate();
        this.elapsedTimeWorker = null;
      }

      // Blob URL 해제
      if (this.elapsedTimeWorkerBlobUrl) {
        URL.revokeObjectURL(this.elapsedTimeWorkerBlobUrl);
      }
    });
  }

  setElapsedTimeWorker() {
    const workerCode = `
      let startTime = 0;
      let intervalId;

      self.addEventListener('message', (e) => {
        switch (e.data.command) {
          case 'start':
            if (!intervalId) { // 중복 타이머 방지
              startTime = performance.now();
              intervalId = setInterval(() => {
                const elapsed = performance.now() - startTime;
                self.postMessage({ elapsed: elapsed / 1000 });
              }, 100);
            }
            break;

          case 'stop':
            if (intervalId) {
              clearInterval(intervalId);
              const elapsed = performance.now() - startTime;
              self.postMessage({ elapsed: elapsed / 1000 });
              intervalId = null;
            }
            break;
        }
      });
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.elapsedTimeWorkerBlobUrl = URL.createObjectURL(blob);
    this.elapsedTimeWorker = new Worker(this.elapsedTimeWorkerBlobUrl);

    this.elapsedTimeWorker.onmessage = (event) => {
      this.elapsedTime.set(event.data.elapsed);
    };
  }

  startTimer() {
    if (!this.elapsedTimeWorker) {
      console.error('ElapsedTimeWorker not initialized');
      return;
    }
    this.elapsedTimeWorker.postMessage({ command: 'start' });
  }

  stopTimer() {
    if (!this.elapsedTimeWorker) {
      console.error('ElapsedTimeWorker not initialized');
      return;
    }
    this.elapsedTimeWorker.postMessage({ command: 'stop' });
  }

  // Helper trnasfer functions
  objectToArrayBuffer(obj: any): ArrayBuffer {
    const string = JSON.stringify(obj);
    const encoder = new TextEncoder();
    return encoder.encode(string).buffer;
  }

  arrayBufferToObject(buffer: ArrayBuffer): any {
    const decoder = new TextDecoder();
    const string = decoder.decode(new Uint8Array(buffer));
    return JSON.parse(string);
  }

  // float32 to wav
  float32ToWav(audio: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + audio.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF Chunk Descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audio.length * 2, true); // file size - 8
    writeString(8, 'WAVE');

    // FMT Subchunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, 1, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample / 8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample / 8)
    view.setUint16(34, 16, true); // BitsPerSample

    // Data Subchunk
    writeString(36, 'data');
    view.setUint32(40, audio.length * 2, true); // Subchunk2Size (NumSamples * NumChannels * BitsPerSample / 8)

    // PCM data
    let offset = 44;
    for (let i = 0; i < audio.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, audio[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return buffer;
  }
}
