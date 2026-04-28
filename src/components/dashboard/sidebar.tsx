"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Mail,
  CalendarDays,
  Newspaper,
  Plug,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Briefing", href: "/briefing", icon: Newspaper },
  { name: "Inbox", href: "/inbox", icon: Mail },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <aside className="sidebar-scroll flex h-screen w-64 flex-col overflow-y-auto bg-sidebar-bg text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
          A
        </div>
        <span className="text-xl font-semibold tracking-tight text-white">
          Aura
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Privacy badge */}
      <div className="mx-3 mb-3 rounded-lg bg-sidebar-muted/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <Shield className="h-3.5 w-3.5" />
          <span>Local-first privacy</span>
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-sidebar-muted px-3 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {session?.user?.image && (
              <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
            )}
            <AvatarFallback className="bg-sidebar-accent text-xs text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {session?.user?.name ?? "Guest"}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {session?.user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1.5 text-sidebar-foreground/40 hover:bg-sidebar-muted hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
