import { AddCardDialog } from "@/components/add-card-dialog";
import { CardsList } from "@/components/cards-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { tServer } from "@/lib/i18n-server";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tServer("cards.overview.title")} - PersonalCFO`,
    description: tServer("cards.overview.description"),
  };
}

export default function CardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={tServer("cards.overview.title")}
        description={tServer("cards.overview.description")}
        action={
          <AddCardDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {tServer("cards.addCard")}
            </Button>
          </AddCardDialog>
        }
      />
      <CardsList />
    </div>
  );
}
