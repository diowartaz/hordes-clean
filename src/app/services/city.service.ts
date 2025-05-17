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
} from '../models/hordes';
import { formatTimeToString } from '../shared/utils/time';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  API_URL = environment.API_URL;
  city = signal<CityModel>(createDefaultCityModel());
  stats = signal<StatsModel>(createDefaultStatsModel());
  defaultValues = signal<DefaultValuesModel>(createDefaultDefaultValuesModel());
  state = signal<string>('noCity');
  playerLoaded = signal<boolean>(false);
  cityTimeSeconds = signal<number>(8 * 60 * 60);
  cityTimeSecondsString = computed(() =>
    formatTimeToString(this.cityTimeSeconds(), true)
  );
  intervalId!: ReturnType<typeof setInterval>;

  constructor(private httpClient: HttpClient) {}

  loadPlayer(): Observable<LoadPlayerModel> {
    const url: string = this.API_URL + 'player';
    return this.httpClient.get<LoadPlayerModel>(url).pipe(
      map((response: LoadPlayerModel) => {
        //TODO: if erreur: vider le local storage
        this.log('loadPlayer', response);
        this.state.set(response.player.state);
        this.stats.set(response.player.stats);
        this.city.set(
          response.player.city ? response.player.city : createDefaultCityModel()
        );
        this.defaultValues.set(response.default_values);
        this.updateTime(
          response.player.city ? response.player.city : createDefaultCityModel()
        );
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
        this.updateTime(response.player.city);
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
        this.updateTime(response.city);
        return response;
      })
    );
  }

  build(id: number): Observable<CityWrapperModel> {
    const url: string = this.API_URL + 'city/build/' + id;
    return this.httpClient.post<CityWrapperModel>(url, {}).pipe(
      map((response: CityWrapperModel) => {
        this.log('build', response);
        this.updateTime(response.city);
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
        this.updateTime(response.city);
        return response;
      })
    );
  }

  log(functionName: string, response: unknown) {
    return;
    console.log(functionName, 'response', response);
  }

  updateTime(city: CityModel) {
    if (!this.city()) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      return;
    }
    const timeToAdd = Math.floor(
      ((new Date().getTime() - this.city().last_timestamp_request) *
        this.defaultValues().coef_realtime_to_ingametime) /
        1000
    );
    if (city.time + timeToAdd > this.defaultValues().day_end_time) {
      //fin de journee
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.cityTimeSeconds.set(this.defaultValues().day_end_time);
      return;
    }
    this.cityTimeSeconds.set(city.time + timeToAdd);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.addTime();
    }, Math.floor((60 * 1000) / this.defaultValues().coef_realtime_to_ingametime));
  }

  addTime() {
    const x = this.cityTimeSeconds() + 60;
    if (x >= this.defaultValues().day_end_time) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      //fin de journee
    } else {
      this.cityTimeSeconds.set(x);
    }
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
        //city
        this.log('startDay', response);
        this.city.set(response.city);
        this.state.set('playing');
        this.updateTime(response.city);
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
}
