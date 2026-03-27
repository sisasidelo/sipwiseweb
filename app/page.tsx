"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadFromStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { UserProfile } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const profile = loadFromStorage<UserProfile>(STORAGE_KEYS.profile);
    router.replace(profile ? "/drinks" : "/profile");
    setChecked(true);
  }, [router]);

  if (!checked) {
    return <p className="text-center py-10">Loading...</p>;
  }
  return null;
}
