"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

export default function ProfileForm() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>({
    age: undefined,
    sex: "male",
    weightKg: 0,
    customMetabolismRate: undefined,
  });

  // Load existing profile from storage
  useEffect(() => {
    const saved = loadFromStorage<UserProfile>(STORAGE_KEYS.profile);
    if (saved) setProfile(saved);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]:
        name === "age" || name === "weightKg"
          ? Number(value)
          : name === "customMetabolismRate"
          ? (value === "" ? undefined : Number(value))
          : value,
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveToStorage(STORAGE_KEYS.profile, profile);
    alert("Profile saved ✅");
    router.push("/drinks");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bg text-text shadow-lg rounded-xl p-6 space-y-5 max-w-md mx-auto border border-primary/30"
    >
      <h2 className="text-xl font-bold text-primary mb-2">Your Profile</h2>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium mb-1">Age</label>
        <input
          type="number"
          name="age"
          value={profile.age ?? ""}
          onChange={handleChange}
          className="w-full border border-primary/40 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-bg text-text transition"
          required
          min={18}
          max={120}
        />
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-medium mb-1">Sex</label>
        <select
          name="sex"
          value={profile.sex}
          onChange={handleChange}
          className="w-full border border-primary/40 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-bg text-text transition"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
        <input
          type="number"
          name="weightKg"
          value={profile.weightKg || ""}
          onChange={handleChange}
          className="w-full border border-primary/40 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-bg text-text transition"
          required
          min={30}
          max={250}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-bg font-semibold py-2 rounded-lg shadow hover:opacity-90 transition"
      >
        Save Profile
      </button>
    </form>
  );
}
