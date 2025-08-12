import { Timestamp } from "firebase/firestore"
import { z } from "zod"

// User roles
export type UserRole = "admin" | "atendente" | "instalador"

// Zod schemas for validation
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
})

export const VehicleSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  plate: z.string().min(1, "Placa é obrigatória"),
  brand: z.string().min(1, "Marca é obrigatória"), // added brand field
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.number().optional(),
  color: z.string().optional(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
})

export const ServiceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  basePrice: z.number().min(0, "Preço deve ser maior que zero"),
  description: z.string().optional(),
  active: z.boolean().default(true),
})

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior que zero"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  createdAt: z.instanceof(Timestamp),
})

export const InventoryRollSchema = z.object({
  id: z.string(),
  brand: z.string().min(1, "Marca é obrigatória"), // added brand field
  tonality: z.string().min(1, "Tonalidade é obrigatória"), // renamed from tone
  width: z.number().min(1, "Largura deve ser maior que zero"), // renamed from width_mm
  totalLength: z.number().min(0, "Comprimento total deve ser maior ou igual a zero"), // renamed from length_m_total
  availableLength: z.number().min(0, "Comprimento disponível deve ser maior ou igual a zero"), // renamed from length_m_available
  cost: z.number().min(0).optional(),
  supplier: z.string().optional(),
  batch: z.string().optional(), // renamed from lot
  lowStockAlert: z.number().min(0).optional(), // renamed from lowStockAlertAt_m
  createdAt: z.instanceof(Timestamp),
})

export type OrderStatus = "aberta" | "em_execucao" | "aguardando_retirada" | "concluida" | "cancelada"
export type PaymentMethod = "dinheiro" | "pix" | "credito" | "debito" | "outro"
export type CashEntryType = "receita" | "despesa"

export const WorkOrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  vehicleId: z.string(),
  services: z.array(
    // renamed from items
    z.object({
      serviceId: z.string(),
      quantity: z.number().min(1), // renamed from qty
      unitPrice: z.number().min(0),
    }),
  ),
  tonality: z.string().optional(), // renamed from tone
  rollId: z.string().optional(),
  metersUsed: z.number().min(0).optional(),
  assignedTo: z.string().optional(), // renamed from assignedToUserId
  status: z.enum(["aberta", "em_execucao", "aguardando_retirada", "concluida", "cancelada"]),
  scheduledAt: z.instanceof(Timestamp).optional(),
  finishedAt: z.instanceof(Timestamp).optional(),
  discount: z.number().min(0).default(0), // renamed from discounts
  total: z.number().min(0),
  paymentMethod: z.enum(["dinheiro", "pix", "credito", "debito", "outro"]).optional(), // simplified payment structure
  paymentReceived: z.boolean().default(false),
  paymentReceivedAt: z.instanceof(Timestamp).optional(),
  photos: z
    .array(
      z.object({
        path: z.string(),
        url: z.string(),
        uploadedAt: z.instanceof(Timestamp),
        uploadedBy: z.string(), // renamed from by
      }),
    )
    .default([]),
  notes: z.string().optional(), // added notes field
  createdAt: z.instanceof(Timestamp),
  createdBy: z.string(), // added createdBy field
  updatedAt: z.instanceof(Timestamp),
  updatedBy: z.string().optional(), // added updatedBy field
})

export const OrderSchema = WorkOrderSchema // keep backward compatibility

export const CashEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["receita", "despesa"]),
  amount: z.number().min(0, "Valor deve ser maior que zero"),
  method: z.enum(["dinheiro", "pix", "credito", "debito", "outro"]).optional(),
  refOrderId: z.string().optional(),
  notes: z.string().optional(),
  at: z.instanceof(Timestamp),
  by: z.string(),
})

export const ScheduleBlockSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Título é obrigatório"),
  start: z.instanceof(Timestamp),
  end: z.instanceof(Timestamp),
  installerId: z.string().optional(),
  orderId: z.string().optional(),
  notes: z.string().optional(),
})

export const PaymentConfigSchema = z.object({
  money: z.boolean().default(true),
  pix: z.boolean().default(true),
  credit: z.boolean().default(true),
  debit: z.boolean().default(true),
  other: z.boolean().default(false),
})

export const AppSettingsSchema = z.object({
  payment: PaymentConfigSchema,
  shop: z.object({
    name: z.string().default("Oficina Insufilm"),
    cnpj: z.string().optional(),
    address: z.string().optional(),
  }),
})

// TypeScript types derived from schemas
export type Customer = z.infer<typeof CustomerSchema>
export type Vehicle = z.infer<typeof VehicleSchema>
export type ServiceItem = z.infer<typeof ServiceItemSchema>
export type Service = z.infer<typeof ServiceSchema> // added Service type
export type InventoryRoll = z.infer<typeof InventoryRollSchema>
export type WorkOrder = z.infer<typeof WorkOrderSchema> // added WorkOrder type
export type Order = z.infer<typeof OrderSchema>
export type CashEntry = z.infer<typeof CashEntrySchema>
export type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>
export type PaymentConfig = z.infer<typeof PaymentConfigSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>

export interface User {
  uid: string
  email: string
  role: UserRole
  name?: string
  createdAt: Timestamp
}
