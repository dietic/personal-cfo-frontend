"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AnalyticsDateFilterProps {
  onDateRangeChange: (startDate?: string, endDate?: string) => void;
  className?: string;
}

export function AnalyticsDateFilter({
  onDateRangeChange,
  className,
}: AnalyticsDateFilterProps) {
  const { t } = useI18n();
  const [date, setDate] = useState<DateRange | undefined>();
  const [preset, setPreset] = useState<string>("custom");

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (value) {
      case "last-7-days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
        break;
      case "last-30-days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        break;
      case "current-month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "last-month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "last-3-months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = today;
        break;
      case "last-6-months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        endDate = today;
        break;
      case "current-year":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
      case "last-year":
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case "may-2025":
        startDate = new Date(2025, 4, 1); // May 2025
        endDate = new Date(2025, 4, 31);
        break;
      case "custom":
        // Don't set dates for custom, let user pick
        return;
      default:
        return;
    }

    const range = { from: startDate, to: endDate };
    setDate(range);
    onDateRangeChange(
      format(startDate, "yyyy-MM-dd"),
      format(endDate, "yyyy-MM-dd")
    );
  };

  const handleCustomDateChange = (range: DateRange | undefined) => {
    setDate(range);
    setPreset("custom");

    if (range?.from && range?.to) {
      onDateRangeChange(
        format(range.from, "yyyy-MM-dd"),
        format(range.to, "yyyy-MM-dd")
      );
    } else if (range?.from) {
      onDateRangeChange(
        format(range.from, "yyyy-MM-dd"),
        format(range.from, "yyyy-MM-dd")
      );
    } else {
      onDateRangeChange(undefined, undefined);
    }
  };

  // Initialize with May 2025 (where we have data) as a custom range
  useEffect(() => {
    const startDate = new Date(2025, 4, 1); // May 1, 2025
    const endDate = new Date(2025, 4, 31); // May 31, 2025

    const range = { from: startDate, to: endDate };
    setDate(range);
    // Keep as custom so user can see the actual date range
    onDateRangeChange(
      format(startDate, "yyyy-MM-dd"),
      format(endDate, "yyyy-MM-dd")
    );
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("analytics.dateFilter.selectPeriod")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last-7-days">
            {t("analytics.dateFilter.last7")}
          </SelectItem>
          <SelectItem value="last-30-days">
            {t("analytics.dateFilter.last30")}
          </SelectItem>
          <SelectItem value="current-month">
            {t("analytics.dateFilter.currentMonth")}
          </SelectItem>
          <SelectItem value="last-month">
            {t("analytics.dateFilter.lastMonth")}
          </SelectItem>
          <SelectItem value="last-3-months">
            {t("analytics.dateFilter.last3")}
          </SelectItem>
          <SelectItem value="last-6-months">
            {t("analytics.dateFilter.last6")}
          </SelectItem>
          <SelectItem value="current-year">
            {t("analytics.dateFilter.currentYear")}
          </SelectItem>
          <SelectItem value="last-year">
            {t("analytics.dateFilter.lastYear")}
          </SelectItem>
          <SelectItem value="may-2025">
            {t("analytics.dateFilter.may2025")}
          </SelectItem>
          <SelectItem value="custom">
            {t("analytics.dateFilter.custom")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, yyyy")} -{" "}
                  {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>{t("analytics.dateFilter.pickRange")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCustomDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
