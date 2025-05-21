import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { CityService } from '../../services/city.service';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { finalize, take } from 'rxjs';
import { RoutesEnum } from '../../models/routes';

@Component({
  selector: 'app-hordes',
  imports: [CommonModule, RouterOutlet, RouterModule],
  standalone: true,
  templateUrl: './hordes.component.html',
  styleUrl: './hordes.component.scss',
})
export class HordesComponent implements OnInit {
  loading = signal<boolean>(false);
  content = signal<string>('dig');
  readonly RouteEnum = RoutesEnum;

  // private _endDayEffect = effect(() => {
  //   if (this.cityService.cityTimeSeconds() > 24 * 60 * 60) {
  //     this.endDay();
  //   }
  // });

  constructor(
    public cityService: CityService,
    private router: Router,
    public dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const content = localStorage.getItem('play-route');
    if (content && content.length > 0) {
      this.content.set(content);
    }
  }

  endDay() {
    if (this.loading()) {
      return;
    }
    this.loading.set(true);
    this.cityService
      .endDay()
      .pipe(
        take(1),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe(() => {
        this.router.navigate([RoutesEnum.RECAP]);
      });
  }

  changeContent(content: string) {
    this.content.set(content);
    localStorage.setItem('play-route', content);
    this.router.navigate([RoutesEnum.PLAY, content]);
  }
}
