"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import type { IncomeFilters } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface IncomesFilterProps {
  onFiltersChange: (filters: IncomeFilters) => void;
  initialFilters?: IncomeFilters;
}

export function IncomesFilter({
  onFiltersChange,
  initialFilters = {},
}: IncomesFilterProps) {
  const { t } = useI18n();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [incomeType, setIncomeType] = useState<string | undefined>(undefined);

  // Use ref to track if we've initialized to prevent repeated initialization
  const initializedRef = useRef(false);

  // Initialize filters with initial values - only run once
  useEffect(() => {
    if (!initializedRef.current) {
      // Only set dates if they are explicitly provided in initialFilters
      // No default dates - "no filters" means "show all"
      if (initialFilters.start_date) {
        setStartDate(parseISO(initialFilters.start_date));
      }
      if (initialFilters.end_date) {
        setEndDate(parseISO(initialFilters.end_date));
      }
      
      if (initialFilters.is_recurring !== undefined) {
        setIncomeType(initialFilters.is_recurring.toString());
      } else {
        setIncomeType("all");
      }
      initializedRef.current = true;
    }
  }, []); // Empty dependency array - only run once

  // Stable callback to notify parent of filter changes
  const notifyFiltersChange = useCallback(() => {
    const filters: IncomeFilters = {};

    if (startDate) {
      filters.start_date = format(startDate, "yyyy-MM-dd");
    }
    if (endDate) {
      filters.end_date = format(endDate, "yyyy-MM-dd");
    }
    if (incomeType && incomeType !== "all") {
      filters.is_recurring = incomeType === "true";
    }

    onFiltersChange(filters);
  }, [startDate, endDate, incomeType, onFiltersChange]);

  // Notify parent when filters change
  useEffect(() => {
    // Only notify after initial setup is complete
    if (initializedRef.current) {
      notifyFiltersChange();
    }
  }, [startDate, endDate, incomeType, notifyFiltersChange]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setIncomeType(undefined);
  };

  const hasFilters = startDate || endDate || incomeType;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            {/* Start Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(startDate, "MMM d")
                    : t("incomes.filters.startDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* End Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate
                    ? format(endDate, "MMM d")
                    : t("incomes.filters.endDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Income Type Filter */}
            <Select value={incomeType} onValueChange={setIncomeType}>
              <SelectTrigger>
                <SelectValue placeholder={t("incomes.filters.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("incomes.filters.allTypes")}</SelectItem>
                <SelectItem value="true">{t("incomes.recurring")}</SelectItem>
                <SelectItem value="false">{t("incomes.oneTime")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="mr-2 h-4 w-4" />
              {t("common.clearFilters")}
            </Button>
          )}
        </div>

        {hasFilters && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              {startDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t("incomes.filters.startDate")}: {format(startDate, "PP")}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setStartDate(undefined)}
                  />
                </Badge>
              )}
              {endDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t("incomes.filters.endDate")}: {format(endDate, "PP")}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setEndDate(undefined)}
                  />
                </Badge>
              )}
              {incomeType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t("incomes.filters.type")}:{" "}
                  {incomeType === "true"
                    ? t("incomes.recurring")
                    : t("incomes.oneTime")}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setIncomeType(undefined)}
                  />
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}