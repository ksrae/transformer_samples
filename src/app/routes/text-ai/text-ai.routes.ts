import { Routes } from '@angular/router';
import { TextAiComponent } from './text-ai.component';

export const routes: Routes = [
	{ path: '', component: TextAiComponent, children: [
    {path: '', redirectTo: 'summary', pathMatch: 'full'},
    {path: 'summary', loadComponent: () => import('../../components/summary/summary.component').then((x) => x.SummaryComponent)},
    {path: 'translator', loadComponent: () => import('../../components/translator/translator.component').then((x) => x.TranslatorComponent)},
    {path: 'classification', loadComponent: () => import('../../components/classification/classification.component').then((x) => x.ClassificationComponent)},
    {path: 'feature-extraction', loadComponent: () => import('../../components/feature-extraction/feature-extraction.component').then((x) => x.FeatureExtractionComponent)},
    {path: 'qa', loadComponent: () => import('../../components/qa/qa.component').then((x) => x.QAComponent)},
    {path: 'fillmask', loadComponent: () => import('../../components/fill-mask/fill-mask.component').then((x) => x.FillmaskComponent)},
    {path: 'text2text-generation', loadComponent: () => import('../../components/text2text-generation/text2text-generation.component').then((x) => x.Text2textgenerationComponent)},
    {path: 'text-generation', loadComponent: () => import('../../components/text-generation/text-generation.component').then((x) => x.TextgenerationComponent)},
    {path: 'text-to-audio', loadComponent: () => import('../../components/text-to-audio/text-to-audio.component').then((x) => x.TextToAudioComponent)},


  ]},
  { path: '**', redirectTo: 'summary' }
];
