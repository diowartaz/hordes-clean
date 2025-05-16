export interface PlayerModel {
  city: CityModel;
  stats: StatsModel;
}

export interface StatsModel {
  personal_best_day: number;
  personal_best_zb: number;
  xp: number;
}

export interface CityModel {
  day: number;
  defense: number;
  time: number;
  nb_zb_next_attack_max: number;
  nb_zb_next_attack_min: number;
  nb_zb_previous_attack: number;
  buildings: BuildingModel[];
  skills: SkillModel[];
  nb_zb_history: number[];
  inventory: object;
  speeds: SpeedsModel;
}

export interface SpeedsModel {
  build: number;
  dig: number;
  learn: number;
}

export interface BuildingModel {
  id: number;
  defense: number;
  time: number;
  lvl: number;
  lvl_max: number;
  name: string;
  inventory: object;
  customInventory?: customInventoryModel;
  enoughRessources: boolean;
  enoughTime: boolean;
  buildingTimeString: string;
}

export interface SkillModel {
  id: string;
  name: string;
  speed_name: string;
  lvl: string;
  lvl_max: string;
  lvl_max_max: string;
  time: string;
  avantage_per_lvl: string;
  reduce_time_seconds: string;
}

export interface customInventoryModel {
  found: number;
  nb: number;
  src: string;
  name: string;
}
