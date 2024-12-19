import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { pipeline } from '@huggingface/transformers';
import { SummaryComponent } from './summary/summary.component';
import { TranslatorComponent } from "./translator/translator.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SummaryComponent,
    TranslatorComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'transformer';



}
