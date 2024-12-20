import { Directive, OnDestroy, signal } from '@angular/core';

@Directive({
  selector: '[appElapsedTime]'
})
export class ElapsedTimeDirective implements OnDestroy {
  private worker: Worker;
  private workerBlobUrl: string;
  elapsedTime = signal(0);

  constructor() {
    // Worker 코드를 문자열로 정의
    const workerCode = `
      let startTime = 0;
      let intervalId;

      self.addEventListener('message', (e) => {
        switch (e.data.command) {
          case 'start':
            startTime = performance.now();
            intervalId = setInterval(() => {
              const elapsed = performance.now() - startTime;
              self.postMessage({ elapsed: elapsed / 1000 });
            }, 100);
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

    // Blob 생성 및 URL 생성
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.workerBlobUrl = URL.createObjectURL(blob);

    // Worker 초기화
    this.worker = new Worker(this.workerBlobUrl);

    // Worker로부터 메시지 수신
    this.worker.onmessage = (event) => {
      this.elapsedTime.set(event.data.elapsed);
    };
  }

  startTimer() {
    this.worker.postMessage({ command: 'start' });
  }

  stopTimer() {
    this.worker.postMessage({ command: 'stop' });
  }

  ngOnDestroy() {
    this.worker.postMessage({ command: 'stop' });
    this.worker.terminate();
    // Blob URL 해제
    URL.revokeObjectURL(this.workerBlobUrl);
  }
}
