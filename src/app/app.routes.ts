import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { notAuthenticatedGuard } from './shared/guards/not-authenticated.guard';
import { RoutesEnum } from './models/routes';

export const routes: Routes = [
  {
    path: RoutesEnum.SIGNIN,
    component: LoginComponent,
    canActivate: [notAuthenticatedGuard],
  },
  { path: '', redirectTo: RoutesEnum.PLAY, pathMatch: 'full' },
  { path: '**', redirectTo: RoutesEnum.PLAY },
];
