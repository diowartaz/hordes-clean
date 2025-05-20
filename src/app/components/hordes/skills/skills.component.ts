import { Component, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, take } from 'rxjs';
import { SkillModel } from '../../../models/hordes';
import { CityService } from '../../../services/city.service';
import { CommonModule } from '@angular/common';
import { formatTimeToString } from '../../../shared/utils/time';
import { FormatTimePipe } from '../../../shared/pipes/format-time.pipe';

@Component({
  selector: 'app-skills',
  imports: [CommonModule, FormatTimePipe],
  standalone: true,
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  loading = signal<boolean>(false);
  snackBarOpened = signal<boolean>(false);
  dialogMessage = signal<string>('');

  mappingSkillIdToIcon: Record<number, string> = {
    1: '../../../../assets/icons/pelle.gif',
    2: '../../../../assets/icons/livre.gif',
    3: '../../../../assets/icons/build.webp',
    4: '../../../assets/icons/sleep.gif',
  };

  constructor(
    public cityService: CityService,
    private _snackBar: MatSnackBar
  ) {}

  closeSnackBar() {
    this.snackBarOpened.set(false);
  }

  openSnackBar(message: string) {
    this.dialogMessage.set(message);
    this.snackBarOpened.set(true);
  }

  learn(skill: SkillModel) {
    this.cityService.defaultValues();
    if (this.loading()) {
      return;
    }
    if (!this.isLearnable(skill)) {
      if (
        this.cityService.cityTimeSeconds() +
          skill.time * this.cityService.city().speeds.learn >
        this.cityService.defaultValues().day_end_time
      ) {
        this.openSnackBar('Not enough time');
      } else if (skill.lvl == skill.lvl_max) {
        this.openSnackBar('Already at max level');
      } else {
        this.openSnackBar('Not enough items');
      }
      return;
    }
    this.loading.set(true);
    this.cityService.learn(skill.id).pipe(
      take(1),
      finalize(() => {
        this.loading.set(false);
      })
    );
  }

  isLearnable(skill: SkillModel) {
    const enoughTime: boolean =
      this.cityService.cityTimeSeconds() +
        skill.time * this.cityService.city().speeds.learn <=
      this.cityService.defaultValues().day_end_time;
    const notMaxLevel: boolean = skill.lvl < skill.lvl_max;
    return enoughTime && notMaxLevel;
  }

  getPercentageEfficacity(skill: SkillModel, plusLevel: number) {
    if (skill.id == 4) {
      if (plusLevel === 0) {
        return formatTimeToString(
          this.cityService.dayStartCalculatedTime() -
            skill.reduce_time_seconds * skill.lvl
        );
      } else {
        return formatTimeToString(
          this.cityService.dayStartCalculatedTime() -
            skill.reduce_time_seconds * (skill.lvl + 1)
        );
      }
    }
    return (
      String(
        Math.round((1 - skill.avantage_per_lvl * (skill.lvl + plusLevel)) * 100)
      ) + '%'
    );
  }
}
