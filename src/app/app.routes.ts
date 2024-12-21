import { Routes } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { TranslatorComponent } from './components/translator/translator.component';
import { ClassificationComponent } from './components/classification/classification.component';
import { QAComponent } from './components/qa/qa.component';
import { FillmaskComponent } from './components/fill-mask/fill-mask.component';
import { Text2textgenerationComponent } from './components/text2text-generation/text2text-generation.component';
import { TextgenerationComponent } from './components/text-generation/text-generation.component';
import { AudioClassificationComponent } from './components/audio-classification/audio-classification.component';
import { ZeroShotAudioClassificationComponent } from './components/zero-shot-audio-classification/zero-shot-audio-classification.component';
import { AutomaticSpeechRecognitionComponent } from './components/automatic-speech-recognition/automatic-speech-recognition.component';

export const routes: Routes = [
	{ path: '', children: [
    {path: '', redirectTo: 'summary', pathMatch: 'full'},
    {path: 'summary', component: SummaryComponent},
    {path: 'translator', component: TranslatorComponent},
    {path: 'classification', component: ClassificationComponent},
    {path: 'audio-classification', component: AudioClassificationComponent},
    {path: 'zero-shot-audio-classification', component: ZeroShotAudioClassificationComponent},
    {path: 'speech-recognition', component: AutomaticSpeechRecognitionComponent},
    {path: 'qa', component: QAComponent},
    {path: 'fillmask', component: FillmaskComponent},
    {path: 'text2text-generation', component: Text2textgenerationComponent},
    {path: 'text-generation', component: TextgenerationComponent},
  ]},
  { path: '**', redirectTo: 'summary' }
];
