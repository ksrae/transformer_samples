import { Routes } from '@angular/router';
import { SummaryComponent } from './summary/summary.component';
import { TranslatorComponent } from './translator/translator.component';
import { ClassificationComponent } from './classification/classification.component';
import { QAComponent } from './qa/qa.component';
import { FillmaskComponent } from './fill-mask/fill-mask.component';
import { Text2textgenerationComponent } from './text2text-generation/text2text-generation.component';
import { TextgenerationComponent } from './text-generation/text-generation.component';

export const routes: Routes = [
	{ path: '', children: [
    {path: 'summary', component: SummaryComponent},
    {path: 'translator', component: TranslatorComponent},
    {path: 'classification', component: ClassificationComponent},
    {path: 'qa', component: QAComponent},
    {path: 'fillmask', component: FillmaskComponent},
    {path: 'text2text-generation', component: Text2textgenerationComponent},
    {path: 'text-generation', component: TextgenerationComponent},
  ]}
];
