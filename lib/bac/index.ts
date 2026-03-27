import { UserProfile, DrinkEntry, SimulationResult, BACSnapshot } from "@/types";
import { mlToGramsEthanol, bacToBrac } from "../conversions";
import { getMetabolismRate } from "./metabolism";
import { DISTRIBUTION_RATIO, LEGAL_LIMITS } from "../constants";
import { addMinutesToIso, diffMinutes, roundTo } from "@/utils/time";

/**
 * Simulate BAC curve for a drinking session.
 */
export function simulateSessionBAC(
  profile: UserProfile,
  drinks: DrinkEntry[],
  stepMinutes: number = 5
): SimulationResult {
  if (!profile.weightKg || !profile.sex) {
    throw new Error("Profile must include weight and sex for BAC simulation.");
  }

  // 1. Setup
  const metabolismRate = getMetabolismRate(profile);
  const r = DISTRIBUTION_RATIO[profile.sex] ?? DISTRIBUTION_RATIO.other;
  const bodyWater = profile.weightKg * r * 1000; // g (Widmark volume of distribution)

  // Pre-compute elimination per step:
  // β (g/dL/hr) × step (hr) × V_d (dL) = grams metabolized per step
  const eliminationPerStep = metabolismRate * (stepMinutes / 60) * (bodyWater / 100);

  // 2. Find simulation window
  const startTime = drinks.reduce(
    (earliest, d) =>
      !earliest || d.startTime < earliest ? d.startTime : earliest,
    drinks[0]?.startTime ?? new Date().toISOString()
  );
  const endTime = drinks.reduce((latest, d) => {
    const end = addMinutesToIso(d.startTime, d.durationMinutes);
    return !latest || end > latest ? end : latest;
  }, startTime);

  // extend sim window for metabolism clearance (extra 12 hours buffer)
  const simEnd = addMinutesToIso(endTime, 12 * 60);

  // 3. Initialize — track the remaining ethanol pool, not cumulative total
  const snapshots: BACSnapshot[] = [];
  let ethanolPool = 0; // grams of unmetabolized ethanol currently in the body

  // 4. Time loop
  const totalMinutes = diffMinutes(startTime, simEnd);

  for (let t = 0; t <= totalMinutes; t += stepMinutes) {
    const currentTime = addMinutesToIso(startTime, t);

    // Absorption: add ethanol from drinks active during this step
    drinks.forEach((drink) => {
      const drinkEnd = addMinutesToIso(drink.startTime, drink.durationMinutes);
      if (currentTime >= drink.startTime && currentTime <= drinkEnd) {
        const ethanolGrams = mlToGramsEthanol(drink.volumeMl, drink.abvPercent);
        ethanolPool += (ethanolGrams / drink.durationMinutes) * stepMinutes;
      }
    });

    // Metabolism: linear (Widmark) elimination for this step only
    ethanolPool = Math.max(0, ethanolPool - eliminationPerStep);

    // 5. Convert pool → BAC and BrAC
    const bac = roundTo((ethanolPool * 100) / bodyWater, 4);
    const brac = roundTo(bacToBrac(bac), 4);

    snapshots.push({
      timestamp: currentTime,
      bac,
      brac,
      isLegal: bac <= LEGAL_LIMITS.BAC,
    });

    // Stop early once fully sober and past last drink
    if (bac <= 0 && currentTime > endTime) break;
  }

  // 6. Summary
  const peak = snapshots.reduce(
    (max, snap) => (snap.bac > max.bac ? snap : max),
    snapshots[0]
  );
  const peakIndex = snapshots.indexOf(peak);

  // Legal limit: first crossing below limit after the peak
  const legalLimitSnap =
    snapshots.slice(peakIndex).find((s) => s.bac <= LEGAL_LIMITS.BAC) ?? null;

  // Sober: first zero-BAC after the peak
  const soberSnap =
    snapshots.slice(peakIndex).find((s) => s.bac <= 0) ??
    snapshots[snapshots.length - 1];

  return {
    snapshots,
    peakBAC: peak.bac,
    peakBrAC: peak.brac,
    peakTime: peak.timestamp,
    legalLimitTime: legalLimitSnap ? legalLimitSnap.timestamp : null,
    soberTime: soberSnap.timestamp,
  };
}
