"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"

export function TransactionsFilter() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [card, setCard] = useState<string | undefined>(undefined)
  const [tag, setTag] = useState<string | undefined>(undefined)

  // Mock data
  const categories = ["Food", "Shopping", "Transportation", "Entertainment", "Groceries"]
  const cards = ["Chase Sapphire", "Amex Gold", "Bank of America", "Discover It"]
  const tags = ["essentials", "subscription", "regret", "investment", "fun"]

  const clearFilters = () => {
    setDate(undefined)
    setCategory(undefined)
    setCard(undefined)
    setTag(undefined)
  }

  const hasFilters = date || category || card || tag

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={card} onValueChange={setCard}>
              <SelectTrigger>
                <SelectValue placeholder="Card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger>
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasFilters && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              {date && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {format(date, "PP")}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDate(undefined)} />
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {category}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setCategory(undefined)} />
                </Badge>
              )}
              {card && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Card: {card}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setCard(undefined)} />
                </Badge>
              )}
              {tag && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tag: {tag}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setTag(undefined)} />
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
