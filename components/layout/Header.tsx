"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/profile", label: "Profile" },
  { href: "/drinks", label: "Drinks" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-primary text-white py-3 shadow-md shrink-0">
      <div className="container mx-auto flex items-center justify-between px-4 gap-4">
        <Link href="/" className="text-lg font-bold tracking-wide whitespace-nowrap">
          🍺 SipWise
        </Link>

        <nav className="flex gap-4 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
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
