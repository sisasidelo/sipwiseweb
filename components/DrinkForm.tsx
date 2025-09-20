"use client";

import { useState, useEffect } from "react";
import { DrinkEntry, UserProfile, SimulationResult } from "@/types";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { simulateSessionBAC } from "@/lib/bac/";
import dynamic from "next/dynamic";

const BACChart = dynamic(() => import("./BACChart"), {
  ssr: false,
  loading: () => <p className="text-center py-6 text-text">Loading chart...</p>,
});

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function DrinkForm() {
  const [name, setName] = useState<string>("");
  const [volumeMl, setVolumeMl] = useState<number>(500);
  const [abvPercent, setAbvPercent] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  const [drinks, setDrinks] = useState<DrinkEntry[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // Load drinks from storage on mount
  useEffect(() => {
    const existing = loadFromStorage<DrinkEntry[]>(STORAGE_KEYS.drinks) || [];
    setDrinks(existing);

    const profile = loadFromStorage<UserProfile>(STORAGE_KEYS.profile);
    if (profile && existing.length > 0) {
      setSimulation(simulateSessionBAC(profile, existing));
    }
  }, []);

  const runSimulation = (updatedDrinks: DrinkEntry[]) => {
    const profile = loadFromStorage<UserProfile>(STORAGE_KEYS.profile);
    if (profile && updatedDrinks.length > 0) {
      setSimulation(simulateSessionBAC(profile, updatedDrinks));
    } else {
      setSimulation(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDrink: DrinkEntry = {
      id: generateId(),
      name: name || "Drink",
      volumeMl,
      abvPercent,
      startTime: new Date().toISOString(),
      durationMinutes,
    };

    const updated = [...drinks, newDrink];
    setDrinks(updated);
    saveToStorage(STORAGE_KEYS.drinks, updated);
    runSimulation(updated);

    // Reset form
    setName("");
    setVolumeMl(500);
    setAbvPercent(5);
    setDurationMinutes(30);
  };

  const handleDelete = (id: string) => {
    const updated = drinks.filter((d) => d.id !== id);
    setDrinks(updated);
    saveToStorage(STORAGE_KEYS.drinks, updated);
    runSimulation(updated);
  };

  const handleClear = () => {
    clearStorage(STORAGE_KEYS.drinks);
    setDrinks([]);
    setSimulation(null);
  };

  return (
    <div className="space-y-6">
      {/* Drink Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-bg text-text shadow-lg rounded-xl p-6 space-y-5 max-w-md mx-auto border border-primary/30"
      >
        <h2 className="text-xl font-bold text-primary">Log a Drink</h2>

        {/* Drink Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Drink Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-primary/40 rounded-lg px-3 py-2 bg-bg text-text focus:border-primary focus:ring-2 focus:ring-primary/50 transition"
            placeholder="e.g. Sol Beer"
            required
          />
        </div>

        {/* Volume */}
        <div>
          <label className="block text-sm font-medium mb-1">Volume (ml)</label>
          <input
            type="number"
            value={volumeMl}
            onChange={(e) => setVolumeMl(Number(e.target.value))}
            className="w-full border border-primary/40 rounded-lg px-3 py-2 bg-bg text-text focus:border-primary focus:ring-2 focus:ring-primary/50 transition"
            required
            min={10}
          />
        </div>

        {/* ABV */}
        <div>
          <label className="block text-sm font-medium mb-1">Alcohol % (ABV)</label>
          <input
            type="number"
            step="0.1"
            value={abvPercent}
            onChange={(e) => setAbvPercent(Number(e.target.value))}
            className="w-full border border-primary/40 rounded-lg px-3 py-2 bg-bg text-text focus:border-primary focus:ring-2 focus:ring-primary/50 transition"
            required
            min={0.1}
            max={100}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full border border-primary/40 rounded-lg px-3 py-2 bg-bg text-text focus:border-primary focus:ring-2 focus:ring-primary/50 transition"
            required
            min={1}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-primary text-bg font-semibold py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            Save Drink
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-secondary text-bg font-semibold py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            Clear All
          </button>
        </div>
      </form>

      {/* Drink List */}
      {drinks.length > 0 && (
        <div className="bg-bg border border-primary/20 rounded-xl p-4 max-w-2xl mx-auto shadow">
          <h3 className="font-semibold text-primary mb-2">Logged Drinks</h3>
          <ul className="text-sm space-y-1">
            {drinks.map((d) => (
              <li
                key={d.id}
                className="flex justify-between items-center border-b border-primary/10 last:border-0 py-1"
              >
                <span>
                  {d.name} — {d.volumeMl} ml @ {d.abvPercent}% — {d.durationMinutes} min
                </span>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-secondary hover:underline text-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simulation summary */}
      {simulation && (
        <div className="mt-6 bg-bg border border-primary/20 rounded-xl p-4 shadow max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-primary mb-2">Simulation Results</h3>
          <BACChart result={simulation} />
          <div className="mt-4 text-sm space-y-1">
            <p>Peak BAC: {simulation.peakBAC.toFixed(3)} g/dL</p>
            <p>Peak BrAC: {simulation.peakBrAC.toExponential(3)} g/210L</p>
            <p>Peak Time: {new Date(simulation.peakTime).toLocaleTimeString()}</p>
            {simulation.legalLimitTime && (
              <p>
                Below Legal Limit By:{" "}
                {new Date(simulation.legalLimitTime).toLocaleTimeString()}
              </p>
            )}
            <p>Sober By: {new Date(simulation.soberTime).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
