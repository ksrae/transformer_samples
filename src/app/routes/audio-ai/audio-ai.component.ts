import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-audio-ai',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './audio-ai.component.html',
  styleUrl: './audio-ai.component.scss'
})
export class AudioAiComponent {
}
