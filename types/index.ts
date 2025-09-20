//  User biological sex (affects distribution ratio r)
export type Sex = "male" | "female" | "other";

// User profile (settings page)
export interface UserProfile {
  id?: string;
  age?: number;
  sex: Sex;
  weightKg: number;
  customMetabolismRate?: number; // g/dL/hr, optional override
}

//  A single drink entry
export interface DrinkEntry {
  id: string;                 // unique ID for this drink
  name?: string;              // e.g. "Sol Beer"
  volumeMl: number;           // ml of drink (e.g. 500)
  abvPercent: number;         // alcohol by volume (e.g. 5 for 5%)
  startTime: string;          // ISO timestamp when drink started
  durationMinutes: number;    // how long it took to finish (e.g. 30)
}

// A drinking session (one night / one sitting)
export interface Session {
  id: string;
  userId?: string;
  drinks: DrinkEntry[];
  createdAt: string;          // ISO timestamp of session start
}

// A BAC/BrAC calculation point in time
export interface BACPoint {
  time: string;               // ISO timestamp
  bac: number;                // g/100ml (Blood Alcohol Content)
  brac: number;               // mg/L (Breath Alcohol Concentration)
}

// Snapshot of BAC/BrAC at a given time
export interface BACSnapshot {
  timestamp: string;   // ISO datetime
  bac: number;         // Blood Alcohol Concentration (g/100ml)
  brac: number;        // Breath Alcohol Concentration (mg/L)
  isLegal: boolean;    // Within legal driving limit
}

// Simulation result for an entire drinking session
export interface SimulationResult {
  snapshots: BACSnapshot[]; // time-series data
  peakBAC: number; 
  peakBrAC: number;        
  peakTime: string;         // when peakBAC occurred
  legalLimitTime: string | null; // first time BAC dropped below legal limit
  soberTime: string;        // when BAC reached ~0

}
