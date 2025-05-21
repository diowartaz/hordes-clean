import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CityModel,
  CityWrapperModel,
  createDefaultCityModel,
  createDefaultDefaultValuesModel,
  createDefaultStatsModel,
  DefaultValuesModel,
  DeleteModel,
  endDayModel,
  FindItemsModel,
  LeaderboardPlayerModel,
  LoadPlayerModel,
  ProfilModel,
  StatsModel,
  XPToLVL,
} from '../models/hordes';
import { formatTimeToString } from '../shared/utils/time';
import { XPToLVLandXP, xpToLvl } from '../shared/utils/xp';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  API_URL = environment.API_URL;
  intervalId!: ReturnType<typeof setInterval>;
  city = signal<CityModel>(createDefaultCityModel());
  stats = signal<StatsModel>(createDefaultStatsModel());
  lvlAndXp = computed<XPToLVL>(() => XPToLVLandXP(this.stats().xp));
  defaultValues = signal<DefaultValuesModel>(createDefaultDefaultValuesModel());
  state = signal<string>('noCity');
  playerLoaded = signal<boolean>(false);
  cityTimeSeconds = signal<number>(8 * 60 * 60);
  cityTimeSecondsString = computed<string>(() =>
    formatTimeToString(this.cityTimeSeconds(), true)
  );
  lazyCityTimeSeconds = signal<number>(8 * 60 * 60);
  countUpdateCityTimeSeconds = signal<number>(0);
  dayStartCalculatedTime = computed(() => {
    return this.defaultValues().day_start_time - xpToLvl(this.stats().xp) * 60;
  });
  digCalculatedTime = computed(() => {
    return this.defaultValues().digging_time - this.city().speeds.dig;
  });

  // private readonly _trackCityTimeEffect = effect(() => {
  //   this.cityTimeSeconds();
  //   this.countUpdateCityTimeSeconds.set(this.countUpdateCityTimeSeconds() + 1);

  //   if (this.countUpdateCityTimeSeconds() % 5 === 0) {
  //     this.lazyCityTimeSeconds.set(this.cityTimeSeconds());
  //   }
  // });

  // private readonly _trackCityTimeEffect2 = effect(() => {
  //   console.log('The cityTimeSeconds is', this.cityTimeSeconds());
  // });

  // private readonly _trackCityTimeEffect3 = effect(() => {
  //   console.log('The lazyCityTimeSeconds is', this.lazyCityTimeSeconds());
  // });

  constructor(private httpClient: HttpClient) {}

  loadPlayer(): Observable<LoadPlayerModel> {
    const url: string = this.API_URL + 'player';
    return this.httpClient.get<LoadPlayerModel>(url).pipe(
      map((response: LoadPlayerModel) => {
        //TODO: if erreur: vider le local storage
        this.log('loadPlayer', response);
        const city = response.player.city
          ? response.player.city
          : createDefaultCityModel();

        this.state.set(response.player.state);
        this.stats.set(response.player.stats);
        this.city.set(city);
        this.defaultValues.set(response.default_values);
        this.updateTime(city.time);
        this.playerLoaded.set(true);
        return response;
      })
    );
  }

  new(): Observable<endDayModel> {
    const url: string = this.API_URL + 'city/new';
    return this.httpClient.post<endDayModel>(url, {}).pipe(
      map((response: endDayModel) => {
        this.log('new', response);
        this.city.set(response.player.city);
        this.state.set(response.player.state);
        this.updateTime(response.player.city.time);
        return response;
      })
    );
  }

  delete(): Observable<DeleteModel> {
    const url: string = this.API_URL + 'city/delete';
    return this.httpClient.post<DeleteModel>(url, {}).pipe(
      map((response: DeleteModel) => {
        this.log('delete', response);
        this.city.set(createDefaultCityModel());
        this.state.set('noCity');
        return response;
      })
    );
  }

  findItems(nb: number): Observable<FindItemsModel> {
    const url: string = this.API_URL + 'city/item/find/' + nb;
    return this.httpClient.post<FindItemsModel>(url, {}).pipe(
      map((response: FindItemsModel) => {
        this.log('findItems', response);
        this.city.set(response.city);
        this.updateTime(response.city.time);
        return response;
      })
    );
  }

  build(id: number): Observable<CityWrapperModel> {
    const url: string = this.API_URL + 'city/build/' + id;
    return this.httpClient.post<CityWrapperModel>(url, {}).pipe(
      map((response: CityWrapperModel) => {
        this.log('build', response);
        this.updateTime(response.city.time);
        this.city.set(response.city);
        return response;
      })
    );
  }

  learn(id: number): Observable<CityWrapperModel> {
    const url: string = this.API_URL + 'city/learn/' + id;
    return this.httpClient.post<CityWrapperModel>(url, {}).pipe(
      map((response: CityWrapperModel) => {
        this.log('learn', response);
        this.city.set(response.city);
        this.updateTime(response.city.time);
        return response;
      })
    );
  }

  endDay(): Observable<endDayModel> {
    const url: string = this.API_URL + 'city/day/end';
    return this.httpClient.post<endDayModel>(url, {}).pipe(
      map((response: endDayModel) => {
        this.log('endDay', response);
        this.city.set(response.player.city);
        this.stats.set(response.player.stats);
        this.state.set(response.player.state);
        return response;
      })
    );
  }

  startDay(): Observable<CityWrapperModel> {
    const url: string = this.API_URL + 'city/day/start';
    return this.httpClient.post<CityWrapperModel>(url, {}).pipe(
      map((response: CityWrapperModel) => {
        this.log('startDay', response);
        this.city.set(response.city);
        this.state.set(response.city.state);
        this.updateTime(response.city.time);
        return response;
      })
    );
  }

  getLeaderboardBestDay() {
    const url: string = this.API_URL + 'leaderboard/best-day';
    return this.httpClient.get<LeaderboardPlayerModel[]>(url).pipe(
      map((response: LeaderboardPlayerModel[]) => {
        return response;
      })
    );
  }

  getProfil(id: string) {
    const url: string = this.API_URL + 'profil/' + id;
    return this.httpClient.get<ProfilModel>(url).pipe(
      map((response: ProfilModel) => {
        return response;
      })
    );
  }

  log(functionName: string, response: unknown) {
    // return;
    console.log(functionName, 'response', response);
  }

  updateTime(timeSeconds: number) {
    return;
    if (this.intervalId) clearInterval(this.intervalId);
    this.cityTimeSeconds.set(timeSeconds);

    const intervalMs = Math.floor(
      (60 * 1000) / this.defaultValues().coef_realtime_to_ingametime
    ); //312,5 => toutes les 0.3125 secondes

    this.intervalId = setInterval(() => {
      this.cityTimeSeconds.set(this.cityTimeSeconds() + 60);
    }, intervalMs);
  }
}
