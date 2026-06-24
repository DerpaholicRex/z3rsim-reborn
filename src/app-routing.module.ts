import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { GameComponent } from './components/game/game.component';
import { AboutComponent } from './components/about/about.component';
import { ChangelogComponent } from './components/changelog/changelog.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'standard', component: GameComponent },
  { path: 'open', component: GameComponent },
  { path: 'inverted', component: GameComponent },
  { path: 'qual', component: GameComponent },
  { path: 'mystery', component: GameComponent },
  { path: 'about', component: AboutComponent },
  { path: 'support', redirectTo: 'about', pathMatch: 'full' },
  { path: 'changelog', component: ChangelogComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
