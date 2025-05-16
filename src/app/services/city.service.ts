import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StatsModel } from '../models/hordes';
import { formatTimeToString } from '../shared/utils/time';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  API_URL = environment.API_URL;
  userPlayerCity$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  userPlayerStats$: BehaviorSubject<StatsModel> =
    new BehaviorSubject<StatsModel>({
      personal_best_day: 0,
      personal_best_zb: 0,
      xp: 0,
    });
  defaultValues$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  userPlayerState$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  playerLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  userPlayerCityTime$: BehaviorSubject<any> = new BehaviorSubject<any>({
    string: '8h00',
    seconds: 8 * 60 * 60,
  });

  setInterval: any = null;

  constructor(private httpClient: HttpClient) {}

  getDefaultValues(): Observable<any> {
    let url: string = this.API_URL + 'city/default-values';
    return this.httpClient.get<any>(url).pipe(
      map((response: any) => {
        this.log('getDefaultValues', response);
        this.defaultValues$.next(response.default_values);
      })
    );
  }

  loadPlayer(): Observable<any> {
    let url: string = this.API_URL + 'player';
    return this.httpClient.get<any>(url).pipe(
      map((response: any) => {
        //TODO: if erreur: vider le local storage
        this.log('loadPlayer', response);
        this.userPlayerState$.next(response.player.state);
        this.userPlayerStats$.next(response.player.stats);
        this.userPlayerCity$.next(response.player.city);
        this.defaultValues$.next(response.default_values);
        this.updateTime(response.player.city);
        this.playerLoaded$.next(true);
        return response;
      })
    );
  }

  getPlayerStats(): Observable<any> {
    let url: string = this.API_URL + 'player/stats';
    return this.httpClient.get<any>(url).pipe(
      map((response: any) => {
        this.log('getPlayerStats', response);
        this.userPlayerStats$.next(response.stats);
        return response;
      })
    );
  }

  new(): Observable<any> {
    let url: string = this.API_URL + 'city/new';
    return this.httpClient.post<any>(url, {}).pipe(
      map((response: any) => {
        this.log('new', response);
        this.userPlayerCity$.next(response.player.city);
        this.userPlayerState$.next(response.player.state);
        this.updateTime(response.player.city);
        return response;
      })
    );
  }

  delete(): Observable<any> {
    let url: string = this.API_URL + 'city/delete';
    return this.httpClient.post<any>(url, {}).pipe(
      map((response: any) => {
        this.log('delete', response);
        this.userPlayerCity$.next(null);
        this.userPlayerState$.next('noCity');
        return response;
      })
    );
  }

  findItems(nb: number): Observable<any> {
    let url: string = this.API_URL + 'city/item/find/' + nb;
    return this.httpClient.post<any>(url, {}).pipe(
      map((response: any) => {
        this.log('findItems', response);
        this.userPlayerCity$.next(response.city);
        this.updateTime(response.city);
        return response;
      })
    );
  }

  build(id: number): Observable<any> {
    let url: string = this.API_URL + 'city/build/' + id;
    return this.httpClient.post<any>(url, {}).pipe(
      map((response: any) => {
        this.log('build', response);
        this.updateTime(response.city);
        this.userPlayerCity$.next(response.city);
        return response;
      })
    );
  }

  learn(id: number): Observable<any> {
    let url: string = this.API_URL + 'city/learn/' + id;
    return this.httpClient.post<any>(url, {}).pipe(
      map((response: any) => {
        this.log('learn', response);
        this.userPlayerCity$.next(response.city);
        this.updateTime(response.city);
        return response;
      })
    );
  }

  log(functionName: string, response: any) {
    return;
    console.log(functionName, 'response', response);
  }

  updateTime(city: any) {
    if (!this.userPlayerCity$.getValue()) {
      if (this.setInterval) {
        clearInterval(this.setInterval);
      }
      return;
    }
    let timeToAdd = Math.floor(
      ((new Date().getTime() -
        this.userPlayerCity$.getValue().last_timestamp_request) *
        this.defaultValues$.getValue().coef_realtime_to_ingametime) /
        1000
    );
    if (city.time + timeToAdd > this.defaultValues$.getValue().day_end_time) {
      //fin de journee
      if (this.setInterval) {
        clearInterval(this.setInterval);
      }
      this.userPlayerCityTime$.next({
        string: formatTimeToString(
          this.defaultValues$.getValue().day_end_time,
          true
        ),
        seconds: this.defaultValues$.getValue().day_end_time,
      });
      return;
    }
    this.userPlayerCityTime$.next({
      string: formatTimeToString(city.time + timeToAdd, true),
      seconds: city.time + timeToAdd,
    });
    if (this.setInterval) {
      clearInterval(this.setInterval);
    }
    this.setInterval = setInterval(() => {
      this.addTime();
    }, Math.floor((60 * 1000) / this.defaultValues$.getValue().coef_realtime_to_ingametime));
  }

  addTime() {
    let x = this.userPlayerCityTime$.getValue().seconds + 60;
    if (x >= this.defaultValues$.getValue().day_end_time) {
      if (this.setInterval) {
        clearInterval(this.setInterval);
      }
      //fin de journee
    } else {
      this.userPlayerCityTime$.next({
        string: formatTimeToString(x, true),
        seconds: x,
      });
    }
  }

  endDay(): Observable<any> {
    let url: string = this.API_URL + 'city/day/end';
    return this.httpClient.post<any>(url, {}).pipe(
      map((response: any) => {
        this.log('endDay', response);
        this.userPlayerCity$.next(response.player.city);
        this.userPlayerStats$.next(response.player.stats);
        this.userPlayerState$.next(response.player.state);
        return response;
      })
    );
  }

  startDay(): Observable<any> {
    let url: string = this.API_URL + 'city/day/start';
    return this.httpClient.post<any>(url, {}).pipe(
      map((response: any) => {
        //city
        this.log('startDay', response);
        this.userPlayerCity$.next(response.city);
        this.userPlayerState$.next('playing');
        this.updateTime(response.city);
        return response;
      })
    );
  }

  getLeaderboardBestDay() {
    let url: string = this.API_URL + 'leaderboard/best-day';
    return this.httpClient.get<any>(url).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getProfil(id: string) {
    let url: string = this.API_URL + 'profil/' + id;
    return this.httpClient.get<any>(url).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}
