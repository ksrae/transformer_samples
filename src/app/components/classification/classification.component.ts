import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';
import { ElapsedTimeDirective } from '../../directives/elapsed-time.directive';

@Component({
  selector: 'app-classification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './classification.component.html',
  styleUrl: './classification.component.scss'
})
export class ClassificationComponent extends ElapsedTimeDirective implements OnInit {
  loading = signal(true);
  output = signal('');
  score = signal(0);
  originTextForm = new FormControl('');
  sourceTypeForm = new FormControl('positive'); // positive, star, feel


  ngOnInit() {
    // this.setSummaryPipeline();

    this.originTextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
      }),
    ).subscribe();
  }

  async generate() {
    this.loading.set(true);
    this.output.set('');
    this.score.set(0);
    this.startTimer(); // 시작 시간 기록

    const text = this.originTextForm.value ?? '';
    let classifier;
    let output: any;

    if(this.sourceTypeForm.value === 'positive') {
      classifier = await this.distilbertbaseuncasedfinetunedsst2english(); //
      output = await classifier(text);
    } else if(this.sourceTypeForm.value === 'star') {
      classifier = await this.bertbasemultilingualuncasedsentiment();
      output = await classifier(text, { top_k: 5 });
    } else if(this.sourceTypeForm.value === 'feel') {
      classifier = await this.toxicbert();
      output = await classifier(text, { top_k: undefined });
    }

    console.log({output});

    this.loading.set(false);
    const highestItem = output.length && output.length === 1 ? output[0] : output.sort((a: any, b: any) => b.score - a.score)[0];

    this.output.set(highestItem.label);
    this.score.set(highestItem.score * 100);
    this.stopTimer(); // 시작 시간 기록
  }

  // positive or negative
  async distilbertbaseuncasedfinetunedsst2english() {
    return await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
  }

  // star rating 찬사 정도 아니면 높은 점수 안줌
  async bertbasemultilingualuncasedsentiment() {
    return await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');
  }

  async toxicbert() {
    return await pipeline('text-classification', 'Xenova/toxic-bert');
  }
}
