import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?:
    | {
        label: string;
        href: string;
      }
    | ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action &&
        (typeof action === "object" && "label" in action ? (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          action
        ))}
    </div>
  );
}
