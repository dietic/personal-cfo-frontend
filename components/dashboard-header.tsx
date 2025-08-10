"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { getUserDisplayName, getUserInitials } from "@/lib/utils";
import { useUserProfile } from "@/lib/hooks";

export function DashboardHeader() {
  const { data: user } = useUserProfile();
  // const displayName = getUserDisplayName(user || null);
  const userInitials = getUserInitials(user || null);

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
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.first_name}
              </h1>
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
