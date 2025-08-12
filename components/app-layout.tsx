"use client"

import type React from "react"

import { SidebarNav } from "./sidebar-nav"
import { AuthGuard } from "./auth-guard"
import type { UserRole } from "@/lib/types"

interface AppLayoutProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export function AppLayout({ children, requiredRoles }: AppLayoutProps) {
  return (
    <AuthGuard requiredRoles={requiredRoles}>
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 md:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
