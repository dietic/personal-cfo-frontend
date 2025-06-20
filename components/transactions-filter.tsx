"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCards, useCategories, useCurrencies } from "@/lib/hooks";
import type { TransactionFilters } from "@/lib/types";

interface TransactionsFilterProps {
  onFiltersChange: (filters: TransactionFilters, currency?: string) => void;
  initialFilters?: TransactionFilters; // Add support for initial filters
}

export function TransactionsFilter({
  onFiltersChange,
  initialFilters = {}, // Default to empty object
}: TransactionsFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [card, setCard] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<string | undefined>(undefined);
  
  // Use ref to track if we've initialized to prevent repeated initialization
  const initializedRef = useRef(false);

  // Fetch real data
  const { data: cards } = useCards();
  const { data: categories } = useCategories();
  const { data: currencies } = useCurrencies();

  // Initialize filters with initial values - only run once
  useEffect(() => {
    if (!initializedRef.current) {
      if (initialFilters.card_id) {
        setCard(initialFilters.card_id);
      }
      if (initialFilters.category) {
        setCategory(initialFilters.category);
      }
      if (initialFilters.start_date) {
        setStartDate(parseISO(initialFilters.start_date));
      }
      if (initialFilters.end_date) {
        setEndDate(parseISO(initialFilters.end_date));
      }
      initializedRef.current = true;
    }
  }, []); // Empty dependency array - only run once

  // Stable callback to notify parent of filter changes
  const notifyFiltersChange = useCallback(() => {
    const filters: TransactionFilters = {};

    if (startDate) {
      filters.start_date = format(startDate, "yyyy-MM-dd");
    }
    if (endDate) {
      filters.end_date = format(endDate, "yyyy-MM-dd");
    }
    if (category) {
      filters.category = category;
    }
    if (card) {
      filters.card_id = card;
    }

    // Pass currency separately since backend doesn't support it yet
    onFiltersChange(filters, currency);
  }, [startDate, endDate, category, card, currency, onFiltersChange]);

  // Notify parent when filters change
  useEffect(() => {
    // Only notify after initial setup is complete
    if (initializedRef.current) {
      notifyFiltersChange();
    }
  }, [startDate, endDate, category, card, currency, notifyFiltersChange]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCategory(undefined);
    setCard(undefined);
    setCurrency(undefined);
  };

  const hasFilters = startDate || endDate || category || card || currency;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
            {/* Start Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d") : "Start date"}
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
                  {endDate ? format(endDate, "MMM d") : "End date"}
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

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>

            <Select value={card} onValueChange={setCard}>
              <SelectTrigger>
                <SelectValue placeholder="Card" />
              </SelectTrigger>
              <SelectContent>
                {cards?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.card_name}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>

            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {(currencies || []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
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
              Clear Filters
            </Button>
          )}
        </div>

        {hasFilters && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              {startDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Start: {format(startDate, "PP")}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setStartDate(undefined)}
                  />
                </Badge>
              )}
              {endDate && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  End: {format(endDate, "PP")}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setEndDate(undefined)}
                  />
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category:{" "}
                  {categories?.find((c) => c.name === category)?.name ||
                    category}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setCategory(undefined)}
                  />
                </Badge>
              )}
              {card && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Card: {cards?.find((c) => c.id === card)?.card_name || card}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setCard(undefined)}
                  />
                </Badge>
              )}
              {currency && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Currency: {currency}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setCurrency(undefined)}
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
