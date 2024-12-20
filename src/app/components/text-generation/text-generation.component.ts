import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';
import { ElapsedTimeDirective } from '../../directives/elapsed-time.directive';

@Component({
  selector: 'app-text-generation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './text-generation.component.html',
  styleUrl: './text-generation.component.scss'
})
export class TextgenerationComponent extends ElapsedTimeDirective implements OnInit {
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

    const model = `${this.textForm.value}.`;

    const result = await this.distilgpt2();
    output = await result(model, {
      temperature: 2,
      max_new_tokens: 10,
      repetition_penalty: 1.5,
      no_repeat_ngram_size: 2,
      num_beams: 2,
      num_return_sequences: 2,
    });

    // const result = await this.codegen350Mmono();
    // output = await result(model, {
    //   max_new_tokens: 44,
    // });

    console.log({output});

    this.loading.set(false);
    this.output.set(output[0].generated_text);
    this.stopTimer();
  }

  // token 100개도 오래걸리는데 200개만 되어도 엄청 오래 걸림
  async distilgpt2() {
    return await pipeline('text-generation', 'eachadea/vicuna-7b-1.1');
  }

  async codegen350Mmono() {
    return await pipeline('text-generation', 'Xenova/codegen-350M-mono');
  }
}

