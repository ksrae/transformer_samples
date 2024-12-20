import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline } from '@huggingface/transformers';
import { tap } from 'rxjs';
import { ElapsedTimeDirective } from '../../directives/elapsed-time.directive';

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
export class FillmaskComponent extends ElapsedTimeDirective implements OnInit {
  loading = signal(true);
  output = signal('');
  maskForm = new FormControl('');


  ngOnInit() {
    this.maskForm.valueChanges.pipe(
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

    const model = `${this.maskForm.value} [MASK].`;

    const unmask = await this.bertbasecased();
    output = await unmask(model);

    console.log({output});

    this.loading.set(false);


    const highestItem = output.length && output.length === 1 ? output[0] : output.sort((a: any, b: any) => b.score - a.score)[0];
    this.output.set(highestItem.sequence);

    this.stopTimer(); // 시작 시간 기록
  }

  // positive or negative
  async bertbasecased() {
    return await pipeline('fill-mask', 'Xenova/bert-base-cased');
  }
}

