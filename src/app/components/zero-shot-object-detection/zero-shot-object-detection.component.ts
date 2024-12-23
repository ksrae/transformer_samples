import { CommonModule } from '@angular/common';
import { Component, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

interface DetectionBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

interface DetectionResult {
  score: number;
  label: string;
  box: DetectionBox;
}

interface ProcessedDetectionResult extends DetectionResult {
  displayBox: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}


@Component({
  selector: 'app-zero-shot-object-detection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './zero-shot-object-detection.component.html',
  styleUrls: ['./zero-shot-object-detection.component.scss'],
})
export class ZeroShotObjectDetectionComponent extends CommonDirective implements AfterViewInit {
  @ViewChild('imageElement') imageElement!: ElementRef;
  processedOutput = signal<ProcessedDetectionResult[]>([]);
  private scaleFactor = 1;

  loading = signal(false);
  output = signal([] as any[]);
  score = signal(0);
  imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/astronaut.png');
  label = signal(['human face', 'rocket', 'helmet', 'american flag']);
  // imageUrl = signal('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/beach.png');
  // label = signal(['hat', 'book', 'sunglasses', 'camera']);


  ngAfterViewInit() {
    this.worker = new Worker(new URL('../../workers/zero-shot-object-detection.worker', import.meta.url), {
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
    console.log('output:', output);

    this.processOutput(output);
    this.output.set(output);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.output.set([] as any[]);
    this.startTimer(); // 시작 시간 기록

    const message = {
      value: this.imageUrl(),
      label: this.label(),
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }



  onImageLoad() {
    const img = this.imageElement.nativeElement;
    this.scaleFactor = img.clientWidth / img.naturalWidth;

    // 이미지 로드 후 현재 output 데이터 재처리
    if (this.processedOutput().length > 0) {
      this.processOutput(this.processedOutput());
    }
  }

  private calculatePosition(value: number): number {
    return value * this.scaleFactor;
  }

  private processOutput(output: DetectionResult[]) {
    const processedResults = output.map(item => ({
      ...item,
      displayBox: {
        top: `${this.calculatePosition(item.box.ymin)}px`,
        left: `${this.calculatePosition(item.box.xmin)}px`,
        width: `${this.calculatePosition(item.box.xmax - item.box.xmin)}px`,
        height: `${this.calculatePosition(item.box.ymax - item.box.ymin)}px`
      }
    }));

    this.processedOutput.set(processedResults);
  }
}

