import { ETHANOL_DENSITY, BREATH_BLOOD_RATIO } from "./constants";

/**
 * Convert ml and ABV% into grams of pure ethanol.
 */
export function mlToGramsEthanol(volumeMl: number, abvPercent: number): number {
  return volumeMl * (abvPercent / 100) * ETHANOL_DENSITY;
}

/**
 * Convert BAC (g/100ml blood) → BrAC (mg/L breath).
 * Formula: BrAC = (BAC * 1000) / (BREATH_BLOOD_RATIO / 100)
 */
export function bacToBrac(bac: number): number {
  return (bac * 10000) / BREATH_BLOOD_RATIO;
}

/**
 * Convert BrAC (mg/L breath) → BAC (g/100ml blood).
 */
export function bracToBac(brac: number): number {
  return (brac * BREATH_BLOOD_RATIO) / 10000;
}
