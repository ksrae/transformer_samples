import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-text-ai',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './text-ai.component.html',
  styleUrl: './text-ai.component.scss'
})
export class TextAiComponent {
}
