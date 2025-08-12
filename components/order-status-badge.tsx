"use client"

import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "aberta":
        return { label: "Aberta", variant: "secondary" as const }
      case "em_execucao":
        return { label: "Em Execução", variant: "default" as const }
      case "aguardando_retirada":
        return { label: "Aguardando Retirada", variant: "outline" as const }
      case "concluida":
        return { label: "Concluída", variant: "secondary" as const }
      case "cancelada":
        return { label: "Cancelada", variant: "destructive" as const }
      default:
        return { label: status, variant: "secondary" as const }
    }
  }

  const config = getStatusConfig(status)

  return <Badge variant={config.variant}>{config.label}</Badge>
}
