import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CityService } from '../../services/city.service';
import { RoutesEnum } from '../../models/routes';

const statesToRoutes: Record<string, string> = {
  noCity: 'create-city',
  playing: 'play',
  deathRecap: 'death-recap',
  recap: 'recap',
  '': 'play',
};

export const stateGuard: CanActivateFn = (_route, state) => {
  const cityService = inject(CityService);
  const router = inject(Router);

  if (!cityService.playerLoaded()) {
    return router.createUrlTree([RoutesEnum.LOAD_PLAYER]);
  }
  let desiredStateFromUrl = '';
  for (const [key, value] of Object.entries(statesToRoutes)) {
    if (value === state.url.slice(1).split('/')[0]) {
      desiredStateFromUrl = key;
    }
  }
  if (cityService.state() === desiredStateFromUrl) {
    return true;
  } else {
    return router.createUrlTree([desiredStateFromUrl]);
  }
};
