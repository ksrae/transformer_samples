import { CommonDirective } from '../../directives/common.directive';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-automatic-speech-recognition',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './automatic-speech-recognition.component.html',
  styleUrl: './automatic-speech-recognition.component.scss'
})
export class AutomaticSpeechRecognitionComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal([] as any[]);
  score = signal(0);
  sourceTypeForm = new FormControl('gender'); // gender, star
  audioUrl = signal('');

  private audioContext: AudioContext | null = null;

  ngAfterViewInit() {
    // 기대한 결과가 안나오고 singing이라고만 나옴.
    this.audioUrl.set('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav');

    this.worker = new Worker(new URL('../../workers/automatic-speech-recognition.worker', import.meta.url), {
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

      const message = {
        audioData,
      };

      // Send transferable object
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
