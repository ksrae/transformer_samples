import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';
import { ElapsedTimeDirective } from '../../directives/elapsed-time.directive';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent extends ElapsedTimeDirective implements OnInit {
  loading = signal(true);
  output = signal('');
  originTextForm = new FormControl('');


  ngOnInit() {
    // this.setSummaryPipeline();

    this.originTextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();
  }

  async generateSummary() {
    this.loading.set(true);
    this.output.set('');
    this.startTimer(); // 시작 시간 기록

    // Xenova/t5-small
    // Xenova/bart-large-cnn
    const generator = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    const model = `${this.originTextForm.value}`;
    const output = await generator(model, {
      max_new_tokens: 100,
    } as any);

    console.log({output});

    this.loading.set(false);
    this.output.set((output[0] as any).summary_text);

    this.stopTimer();
  }

}

