import { CardsList } from "@/components/cards-list";
import { PageHeader } from "@/components/page-header";
import { AddCardDialog } from "@/components/add-card-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cards"
        description="Manage your credit and debit cards"
        action={
          <AddCardDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </AddCardDialog>
        }
      />
      <CardsList />
    </div>
  );
}
