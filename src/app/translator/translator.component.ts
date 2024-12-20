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
  sourceLangForm = new FormControl('en');
  targetLangForm = new FormControl('ko');

  sourceLANG = 'en';
  targetLANG = 'ko';
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

  async translate() {
    this.loading = true;


    let translator = await this.m2m100418M(); // 정확도가 낮으나 빠름.
    // let translator = await this.nllb200distilled600M(); // 정확도가 높으나 느림.
    // let translator = await this.mbartlarge50manytomanymmt(); // 정확도가 생각보다 낮은데 속도는 중간정도.

    let output = await translator(this.sourceText, {
      src_lang: this.sourceLANG,
      tgt_lang: this.targetLANG,
    } as any);

    this.loading = false;
    this.translatedText = (output[0] as any).translation_text;
  }

  async m2m100418M() {
    this.sourceLANG = this.sourceLangForm.value === 'en' ? 'en' : 'ko';
    this.targetLANG = this.targetLangForm.value === 'en' ? 'en' : 'ko';
    return await pipeline('translation', 'Xenova/m2m100_418M');
  }

  async nllb200distilled600M() {
    this.sourceLANG = this.sourceLangForm.value === 'en' ? 'eng_Latn' : 'kor_Hang';
    this.targetLANG = this.targetLangForm.value === 'en' ? 'eng_Latn' : 'kor_Hang';

    return await pipeline('translation', 'Xenova/nllb-200-distilled-600M');
  }

  async mbartlarge50manytomanymmt() {
    this.sourceLANG = this.sourceLangForm.value === 'en' ? 'en_XX' : 'ko_KR';
    this.targetLANG = this.targetLangForm.value === 'en' ? 'en_XX' : 'ko_KR';

    return await pipeline('translation', 'Xenova/mbart-large-50-many-to-many-mmt');
  }
}
