import { CommonModule } from '@angular/common';
import { Component, signal, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-zero-shot-audio-classification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './zero-shot-audio-classification.component.html',
  styleUrls: ['./zero-shot-audio-classification.component.scss'],
})
export class ZeroShotAudioClassificationComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal([] as any[]);
  score = signal(0);
  audioUrl = signal('');
  private audioContext: AudioContext | null = null;

  ngAfterViewInit() {
    this.audioUrl.set('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/dog_barking.wav');

    this.worker = new Worker(new URL('../../workers/zero-shot-audio-classification.worker', import.meta.url), {
      type: 'module'
    });

    this.workerMessage();
  }

  workerMessage() {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      this.loading.set(false);
      this.stopTimer();

      const { type, output, error } = event.data;

      if (type === 'SUCCESS') {
        this.successResult(output);
      } else if (type === 'ERROR') {
        console.error('Worker error:', error);
      }
    };
  }

  successResult(output: any[]) {
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
    this.score.set(0);
    this.startTimer();

    try {
      const response = await fetch(this.audioUrl());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const audioBuffer = await response.arrayBuffer();

      const audioData = await this.processAudioBuffer(audioBuffer);
      const candidateLabels = ['dog', 'vaccum cleaner'];

      const message = {
        audioData,
        label: candidateLabels
      };


      this.worker.postMessage(message, [audioData.buffer]);
    } catch (error) {
      console.error('Error in generate:', error);
      this.loading.set(false);
      this.stopTimer();
    }
  }

  private async processAudioBuffer(buffer: ArrayBuffer): Promise<Float32Array> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    const audioBuffer = await this.audioContext.decodeAudioData(buffer);
    return audioBuffer.getChannelData(0); // Use the first audio channel
  }
}

