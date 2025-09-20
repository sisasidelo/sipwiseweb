import { UserProfile } from "@/types";
import { DEFAULT_METABOLISM_RATE } from "../constants";

/**
 * Get metabolism (elimination) rate in g/dL/hr.
 * - Uses custom override if present
 * - Otherwise, adjusts by age + sex
 */
export function getMetabolismRate(profile: UserProfile): number {
  if (profile.customMetabolismRate) return profile.customMetabolismRate;

  const { age, sex } = profile;

  if (!age || !sex) return DEFAULT_METABOLISM_RATE;

  if (sex === "male") {
    if (age < 30) return 0.017;
    if (age < 60) return 0.015;
    return 0.013;
  }

  if (sex === "female") {
    if (age < 30) return 0.015;
    if (age < 60) return 0.014;
    return 0.013;
  }

  // fallback for "other" or missing values
  return DEFAULT_METABOLISM_RATE;
}
