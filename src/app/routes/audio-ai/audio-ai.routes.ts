import { Routes } from '@angular/router';
import { AudioAiComponent } from './audio-ai.component';

export const routes: Routes = [
	{ path: '', component: AudioAiComponent, children: [
    {path: '', redirectTo: 'audio-classification', pathMatch: 'full'},
    {path: 'audio-classification', loadComponent: () => import('../../components/audio-classification/audio-classification.component').then((x) => x.AudioClassificationComponent)},
    {path: 'zero-shot-audio-classification', loadComponent: () => import('../../components/zero-shot-audio-classification/zero-shot-audio-classification.component').then((x) => x.ZeroShotAudioClassificationComponent)},
    {path: 'speech-recognition', loadComponent: () => import('../../components/automatic-speech-recognition/automatic-speech-recognition.component').then((x) => x.AutomaticSpeechRecognitionComponent)},


  ]},
  { path: '**', redirectTo: 'audio-classification' }
];
