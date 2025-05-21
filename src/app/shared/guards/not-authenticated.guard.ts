import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoutesEnum } from '../../models/routes';

export const notAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.userIsLoggedIn()) {
    return true;
  } else {
    const playRoute = localStorage.getItem('play-route') ?? '';
    return router.createUrlTree([RoutesEnum.PLAY, playRoute]);
  }
};
