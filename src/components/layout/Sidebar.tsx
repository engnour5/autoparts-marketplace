"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function Sidebar({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)] hidden lg:block">
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
