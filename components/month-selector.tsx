"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";

interface MonthSelectorProps {
  onMonthChange: (month: string) => void; // Format: "YYYY-MM"
  className?: string;
  value?: string;
}

export function MonthSelector({ onMonthChange, className, value }: MonthSelectorProps) {
  const { t } = useI18n();

  // Generate recent months (last 12 months)
  const generateRecentMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      months.push({ value: monthValue, label: monthName });
    }
    
    return months;
  };

  const months = generateRecentMonths();

  return (
    <div className={className}>
      <Select value={value} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("analytics.monthSelector.selectMonth")} />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}