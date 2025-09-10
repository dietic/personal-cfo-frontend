"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
  color?: string;
  emoji?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select options...",
  disabled = false,
  className,
  searchPlaceholder = "Search options...",
  emptyText = "No options found.",
}: MultiSelectProps) {
  console.log("MultiSelect value:", value);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedValues = useMemo(() => new Set(value), [value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      const newValue = selectedValues.has(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onValueChange(newValue);
    },
    [value, selectedValues, onValueChange]
  );

  const handleClear = useCallback(
    (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = value.filter((v) => v !== optionValue);
      onValueChange(newValue);
    },
    [value, onValueChange]
  );

  const handleClearAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("Clear all clicked, setting value to empty array");
      onValueChange([]);
    },
    [onValueChange]
  );

  const handleSelectAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange(options.map((opt) => opt.value));
    },
    [options, onValueChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-10 h-auto bg-transparent", className)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((val) => {
                const option = options.find((opt) => opt.value === val);
                if (!option) return null;
                
                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md"
                  >
                    {option.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span className="font-medium text-xs truncate max-w-20">{option.label}</span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleClear(val, e);
                      }}
                      className="cursor-pointer hover:opacity-70 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                );
              })
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {value.length > 0 && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleClearAll(e);
                }}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <div className="flex items-center justify-between p-2 border-b">
                <span className="text-xs text-muted-foreground">
                  {value.length} selected
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAll(e);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll(e);
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedValues.has(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {option.emoji && (
                      <span className="text-base">{option.emoji}</span>
                    )}
                    {option.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span className="font-medium">{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}