export function getLVLandXPString(xp: number): any {
  let lvl = xpToLvl(xp);
  let reste = xp - lvlToXp(lvl);
  let xpToNextLvl = lvlToXp(lvl + 1) - lvlToXp(lvl);
  return {
    lvl: lvl,
    xpString: reste + '/' + xpToNextLvl + ' xp',
  };
}
export function xpToLvl(xp: number) {
  let lvl = 10.4067 * Math.log(6.62457 + 0.00043575 * xp) - 18.6718;
  return Math.floor(lvl);
}

export function lvlToXp(lvl: number) {
  let xp = (Math.exp((lvl + 18.6718) / 10.4067) - 6.62457) / 0.00043575;
  return Math.floor(xp);
}
