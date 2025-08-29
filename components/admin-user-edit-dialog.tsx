"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAdminUpdateUser } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { User, UserTypeEnum } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { Edit3, Save, X, UserCog, Shield, Zap, Crown, UserCheck, UserX } from "lucide-react";

interface AdminUserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminUserEditDialog({
  user,
  open,
  onOpenChange,
}: AdminUserEditDialogProps) {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const updateUser = useAdminUpdateUser();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [planTier, setPlanTier] = useState<UserTypeEnum>(UserTypeEnum.FREE);
  const [isActive, setIsActive] = useState(false);

  // Update state when user prop changes or dialog opens
  useEffect(() => {
    if (user && open) {
      setIsAdmin(user.is_admin);
      setPlanTier(user.plan_tier);
      setIsActive(user.is_active);
    }
  }, [user, open]);

  const handleSave = () => {
    if (!user || !currentUser) return;
    
    // Build update data - exclude admin status if current user is editing themselves
    const updateData: any = {
      plan_tier: planTier,
      is_active: isActive,
    };
    
    // Only include admin status if current user is not editing themselves
    if (user.id !== currentUser.id) {
      updateData.is_admin = isAdmin;
    }
    
    updateUser.mutate({
      userId: user.id,
      updateData,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      if (user) {
        setIsAdmin(user.is_admin);
        setPlanTier(user.plan_tier);
        setIsActive(user.is_active);
      } else {
        // Reset to defaults if no user
        setIsAdmin(false);
        setPlanTier(UserTypeEnum.FREE);
        setIsActive(false);
      }
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg">{t("admin.editUser.title")}</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {t("admin.editUser.description", { email: user?.email })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* User Status Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {t("admin.editUser.accountStatus")}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is-active" className="text-sm font-medium">
                  {t("admin.editUser.isActive")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isActive ? t("admin.editUser.activeDescription") : t("admin.editUser.inactiveDescription")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? "default" : "destructive"} className="text-xs">
                  {isActive ? t("admin.status.active") : t("admin.status.inactive")}
                </Badge>
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>
          </div>

          {/* Permissions Section - Hide admin toggle if editing self */}
          {user && currentUser && user.id !== currentUser.id && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("admin.editUser.permissions")}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is-admin" className="text-sm font-medium">
                    {t("admin.editUser.isAdmin")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? t("admin.editUser.adminDescription") : t("admin.editUser.userDescription")}
                  </p>
                </div>
                <Switch
                  id="is-admin"
                  checked={isAdmin}
                  onCheckedChange={setIsAdmin}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          )}

          {/* Subscription Plan Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {t("admin.editUser.subscriptionPlan")}
            </h3>
            
            <div className="space-y-3">
              <Label htmlFor="plan-tier" className="text-sm font-medium">
                {t("admin.editUser.planTier")}
              </Label>
              <Select value={planTier} onValueChange={(value: UserTypeEnum) => setPlanTier(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.editUser.selectPlan")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserTypeEnum.FREE}>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      {t("plans.free")}
                    </div>
                  </SelectItem>
                  <SelectItem value={UserTypeEnum.PLUS}>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      {t("plans.plus")}
                    </div>
                  </SelectItem>
                  <SelectItem value={UserTypeEnum.PRO}>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      {t("plans.pro")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current plan: <span className="font-medium capitalize">{planTier}</span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {t("common.cancel")}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateUser.isPending}
            className="gap-2"
          >
            {updateUser.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("common.save")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}