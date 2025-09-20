// lib/storage.ts

/**
 * Save a value to localStorage.
 * The value will be JSON.stringified.
 */
export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save key "${key}" to storage`, err);
  }
}

/**
 * Load a value from localStorage.
 * It will JSON.parse the value if present, or return null.
 */
export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.error(`Failed to load key "${key}" from storage`, err);
    return null;
  }
}

/**
 * Remove a single key from localStorage.
 */
export function clearStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to clear key "${key}" from storage`, err);
  }
}

/**
 * Append a new item to an array in localStorage.
 * Useful for lists like drinks history.
 */
export function appendToStorage<T>(key: string, item: T): void {
  const existing = loadFromStorage<T[]>(key) || [];
  const updated = [...existing, item];
  saveToStorage(key, updated);
}

/**
 * Remove an item by ID from an array in localStorage.
 * Assumes items are objects with an "id" field.
 */
export function removeFromStorage<T extends { id: string }>(
  key: string,
  id: string
): void {
  const existing = loadFromStorage<T[]>(key) || [];
  const updated = existing.filter((item) => item.id !== id);
  saveToStorage(key, updated);
}
