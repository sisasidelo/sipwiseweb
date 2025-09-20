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
  stepMinutes: number = 30
): SimulationResult {
  if (!profile.weightKg || !profile.sex) {
    throw new Error("Profile must include weight and sex for BAC simulation.");
  }

  // 1. Setup
  const metabolismRate = getMetabolismRate(profile);
  const r = DISTRIBUTION_RATIO[profile.sex] ?? DISTRIBUTION_RATIO.other;
  const bodyWater = profile.weightKg * r * 1000; // in grams (kg → g)

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

  // 3. Initialize
  const snapshots: BACSnapshot[] = [];
  let totalEthanolGrams = 0;

  // 4. Time loop
  const totalMinutes = diffMinutes(startTime, simEnd);

  for (let t = 0; t <= totalMinutes; t += stepMinutes) {
    const currentTime = addMinutesToIso(startTime, t);

    // Absorption: add ethanol from drinks that are being consumed
    drinks.forEach((drink) => {
      const drinkStart = drink.startTime;
      const drinkEnd = addMinutesToIso(drink.startTime, drink.durationMinutes);

      if (currentTime >= drinkStart && currentTime <= drinkEnd) {
        const ethanolGrams = mlToGramsEthanol(drink.volumeMl, drink.abvPercent);
        const gramsPerMinute = ethanolGrams / drink.durationMinutes;
        totalEthanolGrams += gramsPerMinute * stepMinutes;
      }
    });

    // 5. Convert ethanol grams → BAC
    let bac = (totalEthanolGrams * 100) / bodyWater;

    // 6. Apply metabolism (linear elimination)
    const hoursSinceStart = t / 60;
    const elimination = metabolismRate * hoursSinceStart;
    bac = Math.max(0, bac - elimination);

    // 7. Convert to BrAC
    const brac = bacToBrac(bac);

    // 8. Save snapshot
    snapshots.push({
      timestamp: currentTime,
      bac: roundTo(bac, 4),
      brac: roundTo(brac, 3),
      isLegal: bac <= LEGAL_LIMITS.BAC,
    });

    // Stop early if fully sober (and beyond drinking end)
    if (bac <= 0 && currentTime > endTime) break;
  }

  // 9. Summary
  const peak = snapshots.reduce(
    (max, snap) => (snap.bac > max.bac ? snap : max),
    snapshots[0]
  );

  const legalLimitSnap =
    snapshots.find((s) => s.bac <= LEGAL_LIMITS.BAC) ?? null;

  const soberSnap =
    snapshots.find((s) => s.bac <= 0) ?? snapshots[snapshots.length - 1];

  return {
    snapshots,
    peakBAC: peak.bac,
    peakBrAC: peak.brac,
    peakTime: peak.timestamp,
    legalLimitTime: legalLimitSnap ? legalLimitSnap.timestamp : null,
    soberTime: soberSnap.timestamp,
  };
}
