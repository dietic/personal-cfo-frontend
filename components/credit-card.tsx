"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";

interface CreditCardProps {
  card: {
    id: string | number;
    name: string;
    type: string;
    lastFour: string;
    balance?: number; // Made optional since backend doesn't provide it directly
    limit?: number;
    dueDate?: string;
    utilization?: number;
    alerts: Array<{ type: string; message: string }>;
    network?: "visa" | "mastercard" | "amex" | "discover";
    color?: string;
    bankProvider?: {
      id: string;
      name: string;
      short_name?: string | null;
      color_primary?: string | null;
      color_secondary?: string | null;
    } | null;
  };
  className?: string;
}

export function CreditCard({ card, className }: CreditCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { t } = useI18n();

  // Default gradient based on card network
  const getCardGradient = () => {
    if (card.color) return card.color;

    switch (card.network) {
      case "visa":
        return "from-blue-600 to-blue-900 dark:from-blue-500 dark:to-blue-800";
      case "mastercard":
        return "from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500";
      case "amex":
        return "from-emerald-500 to-teal-700 dark:from-emerald-400 dark:to-teal-600";
      case "discover":
        return "from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500";
      default:
        return "from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800";
    }
  };

  // Format card number with spaces
  const formatCardNumber = () => {
    const hidden = card.network === "amex" ? "•••• •••••• " : "•••• •••• •••• ";
    return hidden + card.lastFour;
  };

  return (
    <div
      className={cn(
        "relative perspective-1000 cursor-pointer h-[200px] w-full",
        className
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "absolute w-full h-full transition-transform duration-500 preserve-3d",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute w-full h-full backface-hidden rounded-xl p-5 shadow-lg",
            "bg-gradient-to-br text-white",
            getCardGradient()
          )}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs opacity-80">{card.type}</span>
                <span className="font-bold text-lg">{card.name}</span>
              </div>

              {card.alerts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1 bg-white/20 backdrop-blur-sm"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {card.alerts[0].message}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-yellow-300/90 rounded-md"></div>
                {card.network && (
                  <div className="ml-auto">
                    {card.network === "visa" && (
                      <div className="text-white font-bold italic text-xl">
                        VISA
                      </div>
                    )}
                    {card.network === "mastercard" && (
                      <div className="flex">
                        <div className="w-6 h-6 bg-red-500 rounded-full opacity-80"></div>
                        <div className="w-6 h-6 bg-yellow-500 rounded-full -ml-3 opacity-80"></div>
                      </div>
                    )}
                    {card.network === "amex" && (
                      <div className="text-white font-bold text-xl">AMEX</div>
                    )}
                    {card.network === "discover" && (
                      <div className="text-white font-bold text-lg">
                        DISCOVER
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="font-mono text-lg tracking-wider">
                {formatCardNumber()}
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute w-full h-full backface-hidden rounded-xl p-5 shadow-lg rotate-y-180",
            "bg-gradient-to-br text-white",
            getCardGradient()
          )}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="w-full h-10 bg-black/30 -mx-5 mt-4"></div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t("creditCard.balance")}</span>
                <span className="font-medium">
                  {formatMoney(card.balance || 0, "PEN")}
                </span>
              </div>

              {card.limit !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>{t("creditCard.limit")}</span>
                  <span className="font-medium">
                    {formatMoney(card.limit || 0, "PEN")}
                  </span>
                </div>
              )}

              {card.utilization !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{t("creditCard.utilization")}</span>
                    <span>{card.utilization}%</span>
                  </div>
                  <Progress
                    value={card.utilization}
                    className="h-2 bg-white/20"
                    indicatorClassName={`${
                      card.utilization > 70
                        ? "bg-red-400"
                        : card.utilization > 30
                        ? "bg-amber-400"
                        : "bg-green-400"
                    }`}
                  />
                </div>
              )}

              {card.dueDate && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {t("creditCard.due")}: {formatDate(card.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
