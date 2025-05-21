import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CityService } from '../../services/city.service';
import { RoutesEnum } from '../../models/routes';

export const gameLoadedGuard: CanActivateFn = (_route, state) => {
  const cityService = inject(CityService);
  const router = inject(Router);

  if (!cityService.playerLoaded()) {
    if (state.url.split('/')[1] === RoutesEnum.PLAY) {
      localStorage.setItem('play-route', state.url.split('/')[2]);
    }
    return router.createUrlTree([RoutesEnum.LOAD_PLAYER]);
  }
  return true;
};
