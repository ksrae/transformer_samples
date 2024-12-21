import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkerLoaderService {
  createWorker(url: URL): Worker {
    // Angular 14+ 방식으로 Worker 생성
    return new Worker(url, {
      type: 'module'
    });
  }
}
