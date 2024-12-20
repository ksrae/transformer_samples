import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';

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
export class QAComponent implements OnInit {
  loading = true;
  output = "";
  score = 0;
  questionForm = new FormControl('Who is Sungrae?');
  contextForm = new FormControl(`
    Sungrae is a frontend developer; specially using Angular framework.
    He was born in Seoul, Korea in 1978,
    He studied Computer Science at Weber State University in US.`);


  ngOnInit() {
    this.loading = this.questionForm.value?.length && this.contextForm.value?.length ? false : true;

    this.questionForm.valueChanges.pipe(
      tap(value => {
        this.loading = value && value.length > 0 ? false : true;
      }),
    ).subscribe();

    this.contextForm.valueChanges.pipe(
      tap(value => {
        this.loading = value && value.length > 0 ? false : true;
      }),
    ).subscribe();
  }

  async generate() {
    this.loading = true;
    let output: any;

    const question = this.questionForm.value ?? '';
    const context = this.contextForm.value ?? '';

    let answer = await this.distilbertbaseuncaseddistilledsquad();
    output = await answer(question, context);

    console.log({output});

    this.loading = false;

    this.output = output.answer;
    // this.score = output.score * 100;
  }

  async distilbertbaseuncaseddistilledsquad() {
    return await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');
  }
}

