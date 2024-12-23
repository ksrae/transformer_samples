import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-image-ai',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './image-ai.component.html',
  styleUrl: './image-ai.component.scss'
})
export class ImageAiComponent {
}
