import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';
import { ElapsedTimeDirective } from '../../directives/elapsed-time.directive';

@Component({
  selector: 'app-text2text-generation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './text2text-generation.component.html',
  styleUrl: './text2text-generation.component.scss'
})
export class Text2textgenerationComponent extends ElapsedTimeDirective implements OnInit {
  loading = signal(true);
  output = signal('');
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
    this.output.set('');
    this.startTimer(); // 시작 시간 기록

    let output: any;

    const model = `${this.textForm.value}`;

    const result = await this.LaMiniFlanT5783M();
    output = await result(model, {max_new_tokens: 100} as any);

    console.log({output});

    this.loading.set(false);
    this.output.set(output[0].generated_text);

    this.stopTimer();
  }

  // token 100개도 오래걸리는데 200개만 되어도 엄청 오래 걸림
  async LaMiniFlanT5783M() {
    return await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
  }
}

