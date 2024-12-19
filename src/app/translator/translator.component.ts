import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { env, pipeline,  } from '@huggingface/transformers';
import { tap } from 'rxjs';

@Component({
  selector: 'app-translator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './translator.component.html',
  styleUrl: './translator.component.scss'
})
export class TranslatorComponent implements OnInit {
  sourceTextForm = new FormControl('');
  sourceText = '';
  translatedText: string = '';
  loading: boolean = true;
  error: string = '';

  // Configure custom model loading
   ngOnInit() {
     // this.setTranslationPipeline();

     this.sourceTextForm.valueChanges.pipe(
       tap(value => {
         this.loading = value && value.length > 0 ? false : true;
         this.sourceText = value ?? '';
       }),
     ).subscribe();
   }

  //  async setTranslationPipeline() {
  //   await pipeline(
  //     'translation',
  //     'Xenova/nllb-200-distilled-600M'
  //   );
  //   // 'Xenova/m2m100_418M'
  //   // 'Xenova/mbart-large-50-many-to-many-mmt'
  // }

  async translate() {
    this.loading = true;
    // let output = await this.nllb200distilled600M();

    let output = await this.m2m100418M();
    // let output = await this.mbartlarge50manytomanymmt();

    this.loading = false;
    this.translatedText = (output[0] as any).translation_text;
  }

  async nllb200distilled600M() {
    const translator = await pipeline('translation', 'Xenova/nllb-200-distilled-600M');
    return await translator(this.sourceText, {
      src_lang: 'eng_Latn',
      tgt_lang: 'kor_Hang',
    } as any);

  }

  async m2m100418M() {
    const translator = await pipeline('translation', 'Xenova/m2m100_418M');
    return await translator(this.sourceText, {
      src_lang: 'en',
      tgt_lang: 'ko',
    } as any);

  }

  async mbartlarge50manytomanymmt() {

    const translator = await pipeline('translation', 'Xenova/mbart-large-50-many-to-many-mmt');
    return await translator(this.sourceText, {
      src_lang: 'en_XX',
      tgt_lang: 'ko_KR',
    } as any);

  }
}
