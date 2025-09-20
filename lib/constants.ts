// Physical constants
export const ETHANOL_DENSITY = 0.789; // g/ml (density of pure ethanol)

// Distribution ratios (Widmark factor)
export const DISTRIBUTION_RATIO = {
  male: 0.68,
  female: 0.55,
  other: 0.62, // a safe average fallback
};

// Legal limits (South Africa)
export const LEGAL_LIMITS = {
  BAC: 0.05,   // g/100ml blood
  BRAC: 0.24,  // mg/L breath
};

// Default metabolism elimination rate
// (used only if no profile adjustment or override)
export const DEFAULT_METABOLISM_RATE = 0.015; // g/dL/hr

// Breath : Blood ratio
// (BAC g/100ml blood ↔ BrAC mg/L breath)
export const BREATH_BLOOD_RATIO = 2100;