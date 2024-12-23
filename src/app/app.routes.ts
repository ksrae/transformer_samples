import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', children: [
    {path: '', redirectTo: 'summary', pathMatch: 'full'},
    {path: 'summary', loadComponent: () => import('./components/summary/summary.component').then((x) => x.SummaryComponent)},
    {path: 'translator', loadComponent: () => import('./components/translator/translator.component').then((x) => x.TranslatorComponent)},
    {path: 'classification', loadComponent: () => import('./components/classification/classification.component').then((x) => x.ClassificationComponent)},
    {path: 'audio-classification', loadComponent: () => import('./components/audio-classification/audio-classification.component').then((x) => x.AudioClassificationComponent)},
    {path: 'zero-shot-audio-classification', loadComponent: () => import('./components/zero-shot-audio-classification/zero-shot-audio-classification.component').then((x) => x.ZeroShotAudioClassificationComponent)},
    {path: 'speech-recognition', loadComponent: () => import('./components/automatic-speech-recognition/automatic-speech-recognition.component').then((x) => x.AutomaticSpeechRecognitionComponent)},
    {path: 'qa', loadComponent: () => import('./components/qa/qa.component').then((x) => x.QAComponent)},
    {path: 'fillmask', loadComponent: () => import('./components/fill-mask/fill-mask.component').then((x) => x.FillmaskComponent)},
    {path: 'text2text-generation', loadComponent: () => import('./components/text2text-generation/text2text-generation.component').then((x) => x.Text2textgenerationComponent)},
    {path: 'text-generation', loadComponent: () => import('./components/text-generation/text-generation.component').then((x) => x.TextgenerationComponent)},
    {path: 'image-to-text', loadComponent: () => import('./components/image-to-text/image-to-text.component').then((x) => x.ImageToTextComponent)},
    {path: 'image-classification', loadComponent: () => import('./components/image-classification/image-classification.component').then((x) => x.ImageClassificationComponent)},
    {path: 'image-segmentation', loadComponent: () => import('./components/image-segmentation/image-segmentation.component').then((x) => x.ImageSegmentationComponent)},
    {path: 'zero-shot-image-classification', loadComponent: () => import('./components/zero-shot-image-classification/zero-shot-image-classification.component').then((x) => x.ZeroShotImageClassificationComponent)},
    {path: 'object-detection', loadComponent: () => import('./components/object-detection/object-detection.component').then((x) => x.ObjectDetectionComponent)},
    {path: 'zero-shot-object-detection', loadComponent: () => import('./components/zero-shot-object-detection/zero-shot-object-detection.component').then((x) => x.ZeroShotObjectDetectionComponent)},
    {path: 'document-question-answering', loadComponent: () => import('./components/document-question-answering/document-question-answering.component').then((x) => x.DocumentQuestionAnsweringComponent)},
    {path: 'text-to-audio', loadComponent: () => import('./components/text-to-audio/text-to-audio.component').then((x) => x.TextToAudioComponent)},
    {path: 'image-to-image', loadComponent: () => import('./components/image-to-image/image-to-image.component').then((x) => x.ImageToImageComponent)},

  ]},
  { path: '**', redirectTo: 'summary' }
];
