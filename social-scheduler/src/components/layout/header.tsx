"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold">Welcome back!</h1>
        <p className="text-sm text-muted-foreground">
          Manage your social media posts
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
