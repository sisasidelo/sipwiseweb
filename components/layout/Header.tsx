"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/profile", label: "Profile" },
  { href: "/drinks", label: "Drinks" },
  { href: "/history", label: "History" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-primary text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold tracking-wide">
          🍺 SipWise
        </Link>

        {/* Nav links */}
        <nav className="space-x-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors ${
                  isActive
                    ? "text-secondary underline underline-offset-4"
                    : "hover:text-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
