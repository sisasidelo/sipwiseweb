"use client";

import { useState, useEffect } from "react";
import { DrinkEntry, UserProfile, SimulationResult } from "@/types";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { simulateSessionBAC } from "@/lib/bac/";
import { format, addMinutes } from "date-fns";
import dynamic from "next/dynamic";

const BACChart = dynamic(() => import("./BACChart"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm opacity-40">Loading chart...</p>
    </div>
  ),
});

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as unknown as { randomUUID: () => string }).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Format a Date to the value format required by <input type="datetime-local"> */
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function defaultTimes() {
  const now = new Date();
  return {
    start: toDatetimeLocal(now),
    finish: toDatetimeLocal(addMinutes(now, 30)),
  };
}

const inputClass =
  "w-full border border-primary/40 rounded-lg px-3 py-2 bg-bg text-text focus:border-primary focus:ring-2 focus:ring-primary/50 transition text-sm";

export default function DrinkForm() {
  const [name, setName] = useState("");
  const [volumeMl, setVolumeMl] = useState(500);
  const [abvPercent, setAbvPercent] = useState(5);
  const [startTime, setStartTime] = useState(defaultTimes().start);
  const [finishTime, setFinishTime] = useState(defaultTimes().finish);
  const [timeError, setTimeError] = useState<string | null>(null);

  const [drinks, setDrinks] = useState<DrinkEntry[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  useEffect(() => {
    const existing = loadFromStorage<DrinkEntry[]>(STORAGE_KEYS.drinks) || [];
    setDrinks(existing);
    const profile = loadFromStorage<UserProfile>(STORAGE_KEYS.profile);
    if (profile && existing.length > 0) {
      setSimulation(simulateSessionBAC(profile, existing));
    }
  }, []);

  const runSimulation = (updated: DrinkEntry[]) => {
    const profile = loadFromStorage<UserProfile>(STORAGE_KEYS.profile);
    if (profile && updated.length > 0) {
      setSimulation(simulateSessionBAC(profile, updated));
    } else {
      setSimulation(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeError(null);

    const start = new Date(startTime);
    const finish = new Date(finishTime);
    const durationMinutes = Math.round(
      (finish.getTime() - start.getTime()) / 60_000
    );

    if (durationMinutes < 1) {
      setTimeError("Finish time must be at least 1 minute after start.");
      return;
    }

    const newDrink: DrinkEntry = {
      id: generateId(),
      name: name || "Drink",
      volumeMl,
      abvPercent,
      startTime: start.toISOString(),
      durationMinutes,
    };

    const updated = [...drinks, newDrink];
    setDrinks(updated);
    saveToStorage(STORAGE_KEYS.drinks, updated);
    runSimulation(updated);

    // Reset — keep times relative to now for the next entry
    const next = defaultTimes();
    setName("");
    setVolumeMl(500);
    setAbvPercent(5);
    setStartTime(next.start);
    setFinishTime(next.finish);
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,2fr)] lg:h-full">

      {/* LEFT: Add drink form */}
      <div className="lg:overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-bg text-text shadow-lg rounded-xl p-5 space-y-4 border border-primary/30"
        >
          <h2 className="text-xl font-bold text-primary">Log a Drink</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Drink Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Sol Beer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Volume (ml)</label>
            <input
              type="number"
              value={volumeMl}
              onChange={(e) => setVolumeMl(Number(e.target.value))}
              className={inputClass}
              required
              min={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alcohol % (ABV)</label>
            <input
              type="number"
              step="0.1"
              value={abvPercent}
              onChange={(e) => setAbvPercent(Number(e.target.value))}
              className={inputClass}
              required
              min={0.1}
              max={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Started</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setTimeError(null);
              }}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Finished</label>
            <input
              type="datetime-local"
              value={finishTime}
              onChange={(e) => {
                setFinishTime(e.target.value);
                setTimeError(null);
              }}
              className={inputClass}
              required
            />
          </div>

          {timeError && (
            <p className="text-xs text-red-500">{timeError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-bg font-semibold py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            Save Drink
          </button>
        </form>
      </div>

      {/* CENTER: Drink list */}
      <div className="flex flex-col bg-bg border border-primary/20 rounded-xl shadow lg:overflow-hidden lg:min-h-0">
        <div className="flex justify-between items-center px-4 py-3 border-b border-primary/20 shrink-0">
          <h3 className="font-bold text-primary text-sm">
            Logged Drinks
            {drinks.length > 0 && (
              <span className="ml-1.5 text-xs font-normal opacity-40">
                ({drinks.length})
              </span>
            )}
          </h3>
          {drinks.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-secondary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {drinks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
            <p className="text-sm opacity-40 text-center">
              No drinks logged yet.
              <br />
              Add one using the form.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-primary/10 lg:flex-1 lg:overflow-y-auto">
            {drinks.map((d) => {
              const start = new Date(d.startTime);
              const finish = addMinutes(start, d.durationMinutes);
              return (
                <li
                  key={d.id}
                  className="flex justify-between items-start px-4 py-3 gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{d.name}</p>
                    <p className="text-xs opacity-50 mt-0.5">
                      {d.volumeMl} ml · {d.abvPercent}% ABV
                    </p>
                    <p className="text-xs opacity-40 mt-0.5">
                      {format(start, "HH:mm")} → {format(finish, "HH:mm")}{" "}
                      <span className="opacity-60">({d.durationMinutes} min)</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="shrink-0 text-xs text-secondary hover:underline mt-0.5"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* RIGHT: BAC chart */}
      <div className="lg:overflow-y-auto">
        {simulation ? (
          <BACChart result={simulation} />
        ) : (
          <div className="h-48 lg:h-full flex items-center justify-center rounded-xl border border-dashed border-primary/20 bg-bg">
            <p className="text-sm opacity-35 text-center px-8">
              Add drinks to see
              <br />
              your BAC simulation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
