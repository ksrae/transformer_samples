import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';

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
export class SummaryComponent implements OnInit {
  loading = true;
  model = "";
  output = "";
  originTextForm = new FormControl('');


  ngOnInit() {
    // this.setSummaryPipeline();

    this.originTextForm.valueChanges.pipe(
      tap(value => {
        this.loading = value && value.length > 0 ? false : true;
        this.model = value ?? '';
      }),
    ).subscribe();
  }

  // async setSummaryPipeline() {
  //   await pipeline(
  //     'summarization', // task
  //     'Xenova/t5-small' // model
  //   );
  // }

  async generateSummary() {
    this.loading = true;
    const generator = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    const text = this.model;
    const output = await generator(text, {
      max_new_tokens: 100,
    } as any);


    this.loading = false;
    this.output = (output[0] as any).summary_text;
  }

}

