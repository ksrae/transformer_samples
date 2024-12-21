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
}
