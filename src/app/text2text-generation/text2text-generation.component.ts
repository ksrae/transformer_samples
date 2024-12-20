import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';

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
export class Text2textgenerationComponent implements OnInit {
  loading = true;
  output = "";
  score = 0;
  textForm = new FormControl('');


  ngOnInit() {
    this.textForm.valueChanges.pipe(
      tap(value => {
        this.loading = value && value.length > 0 ? false : true;
      }),
    ).subscribe();
  }

  async generate() {
    this.loading = true;
    let output: any;

    const model = `${this.textForm.value}`;

    const result = await this.LaMiniFlanT5783M();
    output = await result(model, {max_new_tokens: 100} as any);

    console.log({output});

    this.loading = false;


    this.output = output[0].generated_text;
  }

  // token 100개도 오래걸리는데 200개만 되어도 엄청 오래 걸림
  async LaMiniFlanT5783M() {
    return await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
  }
}

