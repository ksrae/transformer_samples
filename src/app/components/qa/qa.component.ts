import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

@Component({
  selector: 'app-qa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './qa.component.html',
  styleUrl: './qa.component.scss'
})
export class QAComponent extends CommonDirective implements AfterViewInit {
  loading = signal(false);
  output = signal('');
  score = signal(0);

  questionForm = new FormControl('Who is Sungrae?');
  contextForm = new FormControl(`
    Sungrae is a frontend developer; specially using Angular framework.
    He was born in Seoul, Korea in 1978,
    He studied Computer Science at Weber State University in US.`);


  ngAfterViewInit() {
    this.loading.set(this.questionForm.value?.length && this.contextForm.value?.length ? false : true);

    this.questionForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.contextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/qa.worker', import.meta.url), {
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
    this.output.set(output.answer);
    this.score.set(output.score * 100);
  }

  async generate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }


    this.loading.set(true);
    this.output.set('');
    this.score.set(0);
    this.startTimer(); // 시작 시간 기록


    const question = this.questionForm.value ?? '';
    const context = this.contextForm.value ?? '';

    const message = {
      question,
      context,
    };

    // Convert object to ArrayBuffer for transfer
    const buffer = this.objectToArrayBuffer(message);
    this.worker.postMessage(buffer, [buffer]);
  }

}

