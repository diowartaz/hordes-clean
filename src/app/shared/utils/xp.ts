import { XPToLVL } from '../../models/hordes';

export function XPToLVLandXP(xp: number): XPToLVL {
  const lvl = xpToLvl(xp);
  const remainder = xp - lvlToXp(lvl);
  const xpToNextLvl = lvlToXp(lvl + 1) - lvlToXp(lvl);
  return {
    lvl: lvl.toString(),
    xpString: `${remainder}/${xpToNextLvl} xp`,
  };
}

export function xpToLvl(xp: number) {
  const lvl = 10.4067 * Math.log(6.62457 + 0.00043575 * xp) - 18.6718;
  return Math.floor(lvl);
}

export function lvlToXp(lvl: number) {
  const xp = (Math.exp((lvl + 18.6718) / 10.4067) - 6.62457) / 0.00043575;
  return Math.floor(xp);
}
