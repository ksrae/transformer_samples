import { Routes } from '@angular/router';
import { ImageAiComponent } from './image-ai.component';

export const routes: Routes = [
	{ path: '', component: ImageAiComponent, children: [
    {path: '', redirectTo: 'image-to-text', pathMatch: 'full'},
    {path: 'image-to-text', loadComponent: () => import('../../components/image-to-text/image-to-text.component').then((x) => x.ImageToTextComponent)},
    {path: 'image-classification', loadComponent: () => import('../../components/image-classification/image-classification.component').then((x) => x.ImageClassificationComponent)},
    {path: 'image-segmentation', loadComponent: () => import('../../components/image-segmentation/image-segmentation.component').then((x) => x.ImageSegmentationComponent)},
    {path: 'zero-shot-image-classification', loadComponent: () => import('../../components/zero-shot-image-classification/zero-shot-image-classification.component').then((x) => x.ZeroShotImageClassificationComponent)},
    {path: 'image-feature-extraction', loadComponent: () => import('../../components/image-feature-extraction/image-feature-extraction.component').then((x) => x.ImageFeatureExtractionComponent)},
    {path: 'object-detection', loadComponent: () => import('../../components/object-detection/object-detection.component').then((x) => x.ObjectDetectionComponent)},
    {path: 'zero-shot-object-detection', loadComponent: () => import('../../components/zero-shot-object-detection/zero-shot-object-detection.component').then((x) => x.ZeroShotObjectDetectionComponent)},
    {path: 'document-question-answering', loadComponent: () => import('../../components/document-question-answering/document-question-answering.component').then((x) => x.DocumentQuestionAnsweringComponent)},
    {path: 'image-to-image', loadComponent: () => import('../../components/image-to-image/image-to-image.component').then((x) => x.ImageToImageComponent)},
    {path: 'depth-estimation', loadComponent: () => import('../../components/depth-estimation/depth-estimation.component').then((x) => x.DepthEstimationComponent)},

  ]},
  { path: '**', redirectTo: 'image-to-text' }
];
