"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calendar } from "lucide-react";

interface CreditCardProps {
  card: {
    id: string | number;
    name: string;
    type: string;
    lastFour: string;
    dueDate?: string;
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

  // Get card styling - either custom CSS gradient or Tailwind classes
  const getCardGradient = () => {
    // If we have a custom color (CSS gradient), use it
    if (card.color && card.color.startsWith('linear-gradient')) {
      return { 
        background: card.color,
        className: ''
      };
    }
    
    // If we have a Tailwind gradient class, use it
    if (card.color) {
      return {
        background: '',
        className: card.color
      };
    }

    // Default gradients based on network
    switch (card.network) {
      case "visa":
        return {
          background: '',
          className: "from-blue-600 to-blue-900 dark:from-blue-500 dark:to-blue-800"
        };
      case "mastercard":
        return {
          background: '',
          className: "from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500"
        };
      case "amex":
        return {
          background: '',
          className: "from-emerald-500 to-teal-700 dark:from-emerald-400 dark:to-teal-600"
        };
      case "discover":
        return {
          background: '',
          className: "from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500"
        };
      default:
        return {
          background: '',
          className: "from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800"
        };
    }
  };

  const cardStyle = getCardGradient();

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
            cardStyle.className
          )}
          style={cardStyle.background ? { background: cardStyle.background } : {}}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs opacity-80">{card.type}</span>
                <span className="font-bold text-lg">{card.name}</span>
                {card.bankProvider && (
                  <span className="text-xs opacity-70 mt-1">
                    {card.bankProvider.short_name || card.bankProvider.name}
                  </span>
                )}
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
            cardStyle.className
          )}
          style={cardStyle.background ? { background: cardStyle.background } : {}}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="w-full h-10 bg-black/30 -mx-5 mt-4"></div>

            <div className="space-y-3">
              {card.dueDate && (
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {card.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
