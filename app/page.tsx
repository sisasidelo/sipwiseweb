"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadFromStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { UserProfile } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const profile = loadFromStorage<UserProfile>(STORAGE_KEYS.profile);
    if (profile) {
      setHasProfile(true);
      // ✅ If profile exists, auto-redirect to drinks page
      router.replace("/drinks");
    } else {
       router.replace("/profile");
      setHasProfile(false);
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return <p className="text-center py-10">Loading...</p>;
  }
  // If profile exists, we never really show this page (redirect happens)
  return null;
}
