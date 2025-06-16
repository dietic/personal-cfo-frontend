"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserDisplayName, getUserInitials } from "@/lib/utils";
import { useEffect } from "react";

export function DashboardHeader() {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src="/placeholder.svg?height=56&width=56"
                alt="User"
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
              <p className="text-muted-foreground">
                Here's what's happening with your finances today
              </p>
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Statement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
