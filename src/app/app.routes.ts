import { Routes } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { TranslatorComponent } from './components/translator/translator.component';
import { ClassificationComponent } from './components/classification/classification.component';
import { QAComponent } from './components/qa/qa.component';
import { FillmaskComponent } from './components/fill-mask/fill-mask.component';
import { Text2textgenerationComponent } from './components/text2text-generation/text2text-generation.component';
import { TextgenerationComponent } from './components/text-generation/text-generation.component';

export const routes: Routes = [
	{ path: '', children: [
    {path: '', redirectTo: 'summary', pathMatch: 'full'},
    {path: 'summary', component: SummaryComponent},
    {path: 'translator', component: TranslatorComponent},
    {path: 'classification', component: ClassificationComponent},
    {path: 'qa', component: QAComponent},
    {path: 'fillmask', component: FillmaskComponent},
    {path: 'text2text-generation', component: Text2textgenerationComponent},
    {path: 'text-generation', component: TextgenerationComponent},
  ]},
  { path: '**', redirectTo: 'summary' }
];
