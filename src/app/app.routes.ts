import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { notAuthenticatedGuard } from './shared/guards/not-authenticated.guard';

export const routes: Routes = [
  {
    path: 'signin',
    component: LoginComponent,
    canActivate: [notAuthenticatedGuard],
  },
];
