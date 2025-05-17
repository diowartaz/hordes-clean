import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoutesEnum } from '../../models/routes';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.userIsLoggedIn()) {
    return true;
  } else {
    router.navigate([RoutesEnum.SIGNIN]);
    return false;
  }
};
