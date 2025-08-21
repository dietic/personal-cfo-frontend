"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type PaymentStatus = "success" | "failure" | "pending" | "subscription" | null;

export function PaymentStatusModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>(null);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment") as PaymentStatus;
    if (paymentStatus && ["success", "failure", "pending", "subscription"].includes(paymentStatus)) {
      setStatus(paymentStatus);
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove payment parameter from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("payment");
    router.replace(newUrl.pathname + newUrl.search);
  };

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          title: "¡Pago Exitoso!",
          description: "Tu plan ha sido activado correctamente. Ya puedes disfrutar de todas las funcionalidades premium.",
          buttonText: "Continuar",
          buttonVariant: "default" as const,
        };
      case "failure":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          title: "Pago Fallido",
          description: "Hubo un problema procesando tu pago. Por favor, intenta nuevamente o contacta soporte.",
          buttonText: "Entendido",
          buttonVariant: "destructive" as const,
        };
      case "pending":
        return {
          icon: Clock,
          iconColor: "text-yellow-500",
          title: "Pago Pendiente",
          description: "Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.",
          buttonText: "Entendido",
          buttonVariant: "secondary" as const,
        };
      case "subscription":
        return {
          icon: CreditCard,
          iconColor: "text-blue-500",
          title: "Suscripción Activada",
          description: "Tu suscripción recurrente ha sido configurada exitosamente.",
          buttonText: "Continuar",
          buttonVariant: "default" as const,
        };
      default:
        return null;
    }
  };

  const config = status ? getStatusConfig(status) : null;

  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <IconComponent className={`h-8 w-8 ${config.iconColor}`} />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {config.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleClose}
            variant={config.buttonVariant}
            className="w-full"
          >
            {config.buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}