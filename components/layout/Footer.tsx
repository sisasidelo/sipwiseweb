"use client";
import { useTheme } from "@/components/ThemeProvider";

export default function Footer() {
  const { theme } = useTheme();

  // Sponsor-specific slogans or branding
  const sponsorTaglines: Record<string, string> = {
    default: "Drink responsibly. Don’t drink and drive.",
    heineken: "Open Your World 🌍",
    corona: "This Is Living 🌞",
    blacklabel: "Keep Walking 🥃",
  };

  const sponsorLogos: Record<string, string> = {
    default: "🍻",
    heineken: "🍺⭐",
    corona: "🌴🍺",
    blacklabel: "🥃👑",
  };

  return (
    <footer className="bg-primary text-white py-6 mt-10">
      <div className="container mx-auto text-center text-sm space-y-2">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">SipWise</span>. All rights reserved{" "}
          {sponsorLogos[theme]}
        </p>
        <p className="text-secondary font-medium">
          {sponsorTaglines[theme]}
        </p>
      </div>
    </footer>
  );
}
