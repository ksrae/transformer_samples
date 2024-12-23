import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', children: [
    {path: '', redirectTo: 'text-ai', pathMatch: 'full'},
    {path: 'text-ai', loadChildren: () => import('./routes/text-ai/text-ai.routes').then((x) => x.routes)},
    {path: 'audio-ai', loadChildren: () => import('./routes/audio-ai/audio-ai.routes').then((x) => x.routes)},
    {path: 'image-ai', loadChildren: () => import('./routes/image-ai/image-ai.routes').then((x) => x.routes)},

  ]},
  { path: '**', redirectTo: 'summary' }
];
