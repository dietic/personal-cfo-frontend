"use client";

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
import { useCategories, useCategoryColors } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface CategorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder,
  disabled = false,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { data: categories, isLoading } = useCategories();
  const { getCategoryColor } = useCategoryColors();

  const selectedCategory = (categories as Category[] | undefined)?.find(
    (cat: Category) => cat.name === value
  );
  const computedPlaceholder =
    placeholder || t("transactions.searchCategoryPlaceholder");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: getCategoryColor(selectedCategory.name),
                }}
              />
              <span className="truncate">{selectedCategory.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{computedPlaceholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={t("categorySelect.searchPlaceholder")}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? t("categorySelect.loading")
                : t("categorySelect.empty")}
            </CommandEmpty>
            <CommandGroup>
              {(categories as Category[] | undefined)?.map(
                (category: Category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={(currentValue: string) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCategoryColor(category.name),
                        }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === category.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
