import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CommonDirective } from '../../directives/common.directive';

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
export class TranslatorComponent extends CommonDirective implements AfterViewInit {
  sourceTextForm = new FormControl('');
  sourceLangForm = new FormControl('en');
  targetLangForm = new FormControl('ko');

  sourceLANG = signal('en');
  targetLANG = signal('ko');
  sourceText = signal('');
  translatedText = signal('');
  loading = signal(true);
  error = signal('');

  ngAfterViewInit() {
    this.sourceTextForm.valueChanges.pipe(
      tap(value => {
        this.loading.set(value && value.length > 0 ? false : true);
        this.sourceText.set(value ?? '');
      }),
    ).subscribe();

    this.worker = new Worker(new URL('../../workers/translator.worker', import.meta.url), {
      type: 'module'
    });

    this.workerMessage();
   }


  workerMessage() {
    if(!this.worker) return;

    this.worker.onmessage = (event) => {
      this.loading.set(false);
      this.stopTimer();

      const { type, output, error } = event.data;
      if (type === 'SUCCESS') {
        this.successResult(output);
      } else if (type === 'ERROR') {
        console.error('Worker error:', error);
      }
    };
  }

  successResult(output: any) {
    this.translatedText.set((output[0] as any).translation_text);
  }

  async translate() {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    this.loading.set(true);
    this.translatedText.set('');
    if(this.sourceLangForm.value === this.targetLangForm.value) {
      this.translatedText.set(this.sourceText());
      this.loading.set(false);
      return;
    }

    this.startTimer(); // 시작 시간 기록

    this.sourceLANG.set(this.sourceLangForm.value === 'en' ? 'en' : 'ko');
    this.targetLANG.set(this.targetLangForm.value === 'en' ? 'en' : 'ko');

    // async m2m100418M() {
    //   this.sourceLANG.set(this.sourceLangForm.value === 'en' ? 'en' : 'ko');
    //   this.targetLANG.set(this.targetLangForm.value === 'en' ? 'en' : 'ko');
    //   return await pipeline('translation', 'Xenova/m2m100_418M');
    // }

    // async nllb200distilled600M() {
    //   this.sourceLANG.set(this.sourceLangForm.value === 'en' ? 'eng_Latn' : 'kor_Hang');
    //   this.targetLANG.set(this.targetLangForm.value === 'en' ? 'eng_Latn' : 'kor_Hang');

    //   return await pipeline('translation', 'Xenova/nllb-200-distilled-600M');
    // }

    // async mbartlarge50manytomanymmt() {
    //   this.sourceLANG.set(this.sourceLangForm.value === 'en' ? 'en_XX' : 'ko_KR');
    //   this.targetLANG.set(this.targetLangForm.value === 'en' ? 'en_XX' : 'ko_KR');

    //   return await pipeline('translation', 'Xenova/mbart-large-50-many-to-many-mmt');
    // }

    this.worker.postMessage({
      text: this.sourceText(),
      sourceLang: this.sourceLANG,
      targetLang: this.targetLANG,
    });
  }
}
