"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Wrench,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  description?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "atendente", "instalador"],
    description: "Visão geral do sistema",
  },
  {
    title: "Clientes",
    href: "/customers",
    icon: Users,
    roles: ["admin", "atendente"],
    description: "Gerenciar clientes e veículos",
  },
  {
    title: "Ordens de Serviço",
    href: "/orders",
    icon: FileText,
    roles: ["admin", "atendente", "instalador"],
    description: "Criar e gerenciar OS",
  },
  {
    title: "Agenda",
    href: "/schedule",
    icon: Calendar,
    roles: ["admin", "atendente", "instalador"],
    description: "Agendamentos e calendário",
  },
  {
    title: "Caixa",
    href: "/cashbox",
    icon: DollarSign,
    roles: ["admin", "atendente"],
    description: "Controle financeiro",
  },
  {
    title: "Estoque",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "atendente"],
    description: "Rolos e tonalidades",
  },
  {
    title: "Serviços",
    href: "/services",
    icon: Wrench,
    roles: ["admin", "atendente"],
    description: "Tabela de preços",
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
    description: "Usuários e configurações",
  },
]

interface SidebarNavProps {
  className?: string
}

export function SidebarNav({ className }: SidebarNavProps) {
  const { user, logout, hasRole } = useAuth()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles))

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Oficina Insufilm</h2>
            <p className="text-sm text-muted-foreground">Manager</p>
          </div>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <div
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex w-64 flex-col bg-card border-r", className)}>
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <NavContent />
      </div>
    </>
  )
}
