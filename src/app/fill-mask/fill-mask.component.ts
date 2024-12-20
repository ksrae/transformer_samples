import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';

@Component({
  selector: 'app-fill-mask',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './fill-mask.component.html',
  styleUrl: './fill-mask.component.scss'
})
export class FillmaskComponent implements OnInit {
  loading = true;
  output = "";
  score = 0;
  maskForm = new FormControl('');


  ngOnInit() {
    this.maskForm.valueChanges.pipe(
      tap(value => {
        this.loading = value && value.length > 0 ? false : true;
      }),
    ).subscribe();
  }

  async generate() {
    this.loading = true;
    let output: any;

    const model = `${this.maskForm.value} [MASK].`;

    const unmask = await this.bertbasecased();
    output = await unmask(model);

    console.log({output});

    this.loading = false;


    const highestItem = output.length && output.length === 1 ? output[0] : output.sort((a: any, b: any) => b.score - a.score)[0];
    this.output = highestItem.sequence;
  }

  // positive or negative
  async bertbasecased() {
    return await pipeline('fill-mask', 'Xenova/bert-base-cased');
  }
}

