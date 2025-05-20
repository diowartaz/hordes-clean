import { Component, signal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { CityService } from '../../../services/city.service';
import { getNewInventory } from '../../../shared/utils/inventory';
import { CommonModule } from '@angular/common';
import { FormatTimePipe } from '../../../shared/pipes/format-time.pipe';
import { FindItemsModel, InventoryItem } from '../../../models/hordes';

@Component({
  selector: 'app-diggings',
  imports: [CommonModule, FormatTimePipe],
  standalone: true,
  templateUrl: './diggings.component.html',
  styleUrl: './diggings.component.scss',
})
export class DiggingsComponent {
  nbDigs = signal<number>(1);
  loading = signal<boolean>(false);
  inventory: InventoryItem[] = getNewInventory();

  constructor(public cityService: CityService) {}

  // init: buildingInventoryToUsableInventory(this.inventory, this.city.inventory);

  addDigs(nb: number) {
    this.nbDigs.set(Math.max(this.nbDigs() + nb, 1));
  }

  disableMinusDigs(): boolean {
    return this.nbDigs() - 1 < 1;
  }

  getDiggingsTime(): number {
    return this.nbDigs() * this.cityService.digCalculatedTime();
  }

  digDisabled(): boolean {
    return (
      this.getDiggingsTime() + this.cityService.cityTimeSeconds() >
      this.cityService.defaultValues().day_end_time
    );
  }

  dig() {
    if (this.loading() || this.digDisabled()) {
      return;
    }
    this.loading.set(true);
    this.cityService
      .findItems(this.nbDigs())
      .pipe(
        take(1),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe((result: FindItemsModel) => {
        this.nbDigs.set(1);
        //buildingInventoryToUsableInventory(this.inventory, this.city.inventory);
        this.addItemsFound(result.items_found_inventory);
      });
  }

  addItemsFound(items_found_inventory: Record<string, number>) {
    for (const item of this.inventory) {
      item.found = 0;
    }
    for (const itemName in items_found_inventory) {
      for (const item2 of this.inventory) {
        if (itemName == item2.name) {
          item2.found = items_found_inventory[itemName];
          break;
        }
      }
    }
  }
}
