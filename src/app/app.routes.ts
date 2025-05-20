import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { notAuthenticatedGuard } from './shared/guards/not-authenticated.guard';
import { RoutesEnum } from './models/routes';
import { gameLoadedGuard } from './shared/guards/game-loaded.guard';
import { authGuard } from './shared/guards/auth.guard';
import { stateGuard } from './shared/guards/state.guard';
import { HordesComponent } from './components/hordes/hordes.component';

export const routes: Routes = [
  {
    path: RoutesEnum.SIGNIN,
    component: LoginComponent,
    canActivate: [notAuthenticatedGuard],
  },

  {
    path: RoutesEnum.PLAY,
    component: HordesComponent,
    canActivate: [authGuard, gameLoadedGuard, stateGuard],
  },
  { path: '', redirectTo: RoutesEnum.PLAY, pathMatch: 'full' },
  { path: '**', redirectTo: RoutesEnum.PLAY },
];
