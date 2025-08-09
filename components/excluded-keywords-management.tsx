"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ExcludedKeywordItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

/**
 * ExcludedKeywordsManagement
 *
 * Settings tab content to manage per-user excluded transaction keywords.
 * Transactions matching any keyword (case and diacritics-insensitive) are skipped during AI extraction.
 */
export function ExcludedKeywordsManagement() {
  const [items, setItems] = useState<ExcludedKeywordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getExcludedKeywords();
      setItems(data.items || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to load excluded keywords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async () => {
    if (!newKeyword.trim()) return;
    setAdding(true);
    try {
      const created = await apiClient.addExcludedKeyword(newKeyword.trim());
      setItems((prev) => [created, ...prev]);
      setNewKeyword("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to add keyword");
    } finally {
      setAdding(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await apiClient.deleteExcludedKeyword(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to delete keyword");
    }
  };

  const onReset = async () => {
    try {
      const data = await apiClient.resetExcludedKeywords();
      setItems(data.items || []);
      toast.success("Reset to defaults");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to reset");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Excluded transaction keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add keyword (e.g., INTERESES)"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
            }}
          />
          <Button onClick={onAdd} disabled={adding || !newKeyword.trim()}>
            Add
          </Button>
          <Button variant="outline" onClick={onReset} disabled={loading}>
            Reset to defaults
          </Button>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No excluded keywords yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border rounded px-3 py-2"
              >
                <span className="font-medium">{item.keyword}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
