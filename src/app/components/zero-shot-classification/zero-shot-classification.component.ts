import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, DestroyRef, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap, Subscription } from 'rxjs';
import { ElapsedTimeDirective } from '../../directives/elapsed-time.directive';

@Component({
  selector: 'app-zero-shot-classification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './zero-shot-classification.component.html',
  styleUrls: ['./zero-shot-classification.component.scss'],
})
export class ZeroShotClassificationComponent extends ElapsedTimeDirective implements OnInit, OnDestroy {
  loading = signal(true);
  output = signal('');
  score = signal(0);
  textForm = new FormControl('');

  ngOnInit() {
    this.textForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();
  }

  async generate() {
    this.loading.set(true);
    this.output.set("");
    this.startTimer(); // 시작 시간 기록

    let output: any;

    const model = `${this.textForm.value}`;

    const result = await this.mobilebertuncasedmnli();
    const labels = [ 'mobile', 'billing', 'website', 'account access' ];
    output = await result(model, labels);

    // const result = await this.nlidebertav3xsmall();
    // const labels = [ 'urgent', 'not urgent', 'phone', 'tablet', 'computer' ];
    // output = await classifier(model, labels, { multi_label: true });


    console.log({output});

    this.loading.set(false);

    this.stopTimer();
    // this.output = output[0].generated_text;
  }

  async mobilebertuncasedmnli() {
    return await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
  }

  async nlidebertav3xsmall() {
    return await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-xsmall');
  }
}

