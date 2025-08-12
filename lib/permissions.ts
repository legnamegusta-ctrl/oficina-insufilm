import type { UserRole } from "./types"

export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: ["admin"],
  VIEW_USERS: ["admin"],

  // Customer Management
  MANAGE_CUSTOMERS: ["admin", "atendente"],
  VIEW_CUSTOMERS: ["admin", "atendente", "instalador"],

  // Work Orders
  MANAGE_ALL_ORDERS: ["admin", "atendente"],
  VIEW_ALL_ORDERS: ["admin", "atendente"],
  MANAGE_ASSIGNED_ORDERS: ["instalador"],
  VIEW_ASSIGNED_ORDERS: ["instalador"],

  // Inventory
  MANAGE_INVENTORY: ["admin"],
  VIEW_INVENTORY: ["admin", "atendente"],

  // Services
  MANAGE_SERVICES: ["admin"],
  VIEW_SERVICES: ["admin", "atendente"],

  // Schedule
  MANAGE_SCHEDULE: ["admin", "atendente"],
  VIEW_SCHEDULE: ["admin", "atendente", "instalador"],

  // Cash Register
  MANAGE_CASH: ["admin"],
  VIEW_CASH: ["admin", "atendente"],

  // Settings
  MANAGE_SETTINGS: ["admin"],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  if (!userRole) return false
  return PERMISSIONS[permission].includes(userRole)
}

export function canAccessRoute(userRole: UserRole | undefined, route: string): boolean {
  const routePermissions: Record<string, Permission> = {
    "/dashboard": "VIEW_CUSTOMERS", // Basic access
    "/customers": "VIEW_CUSTOMERS",
    "/orders": "VIEW_ALL_ORDERS",
    "/inventory": "VIEW_INVENTORY",
    "/services": "VIEW_SERVICES",
    "/schedule": "VIEW_SCHEDULE",
    "/cashbox": "VIEW_CASH",
    "/settings": "MANAGE_SETTINGS",
  }

  const permission = routePermissions[route]
  if (!permission) return true // Allow access to routes without specific permissions

  return hasPermission(userRole, permission)
}
