import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';

@Component({
  selector: 'app-zero-shot-classification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './zero-shot-classification.component.html',
  styleUrl: './zero-shot-classification.component.scss'
})
export class ZeroShotClassificationComponent implements OnInit {
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

    const result = await this.mobilebertuncasedmnli();
    const labels = [ 'mobile', 'billing', 'website', 'account access' ];
    output = await result(model, labels);

    // const result = await this.nlidebertav3xsmall();
    // const labels = [ 'urgent', 'not urgent', 'phone', 'tablet', 'computer' ];
    // output = await classifier(model, labels, { multi_label: true });


    console.log({output});

    this.loading = false;


    // this.output = output[0].generated_text;
  }

  async mobilebertuncasedmnli() {
    return await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
  }

  async nlidebertav3xsmall() {
    return await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-xsmall');
  }
}

