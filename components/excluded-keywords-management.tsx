"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import { ExcludedKeywordItem } from "@/lib/types";
import React, { useEffect, useState } from "react";
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
  const { t } = useI18n();

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getExcludedKeywords();
      setItems(data.items || []);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail || t("excludedKeywords.loadFailed")
      );
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
      setItems((prev: ExcludedKeywordItem[]) => [created, ...prev]);
      setNewKeyword("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t("excludedKeywords.addFailed"));
    } finally {
      setAdding(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await apiClient.deleteExcludedKeyword(id);
      setItems((prev: ExcludedKeywordItem[]) =>
        prev.filter((x: ExcludedKeywordItem) => x.id !== id)
      );
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail || t("excludedKeywords.deleteFailed")
      );
    }
  };

  const onReset = async () => {
    try {
      const data = await apiClient.resetExcludedKeywords();
      setItems(data.items || []);
      toast.success(t("excludedKeywords.resetSuccess"));
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail || t("excludedKeywords.resetFailed")
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("excludedKeywords.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder={t("excludedKeywords.placeholder")}
            value={newKeyword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewKeyword(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") onAdd();
            }}
          />
          <Button onClick={onAdd} disabled={adding || !newKeyword.trim()}>
            {t("excludedKeywords.add")}
          </Button>
          <Button variant="outline" onClick={onReset} disabled={loading}>
            {t("excludedKeywords.reset")}
          </Button>
        </div>

        {loading ? (
          <p>{t("common.loading")}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("excludedKeywords.empty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item: ExcludedKeywordItem) => (
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
                  {t("excludedKeywords.remove")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
