"use client"

import { AppLayout } from "@/components/app-layout"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar, DollarSign, Package, Plus, Users, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, {user?.name || user?.email?.split("@")[0]}!</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OS Abertas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">3 para hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recebido Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2.450</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% vs ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agenda Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">agendamentos</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/orders/new">
              <Button className="h-20 w-full flex flex-col items-center justify-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>Nova OS</span>
              </Button>
            </Link>
            <Link href="/inventory/new">
              <Button
                variant="outline"
                className="h-20 w-full flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <Package className="h-6 w-6" />
                <span>Nova Entrada de Estoque</span>
              </Button>
            </Link>
            <Link href="/customers/new">
              <Button
                variant="outline"
                className="h-20 w-full flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <Users className="h-6 w-6" />
                <span>Novo Cliente</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Últimas OS</CardTitle>
              <CardDescription>Ordens de serviço recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "OS-001", customer: "João Silva", status: "Em execução", value: "R$ 350" },
                  { id: "OS-002", customer: "Maria Santos", status: "Aberta", value: "R$ 280" },
                  { id: "OS-003", customer: "Pedro Costa", status: "Concluída", value: "R$ 420" },
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.value}</p>
                      <p className="text-sm text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agenda de Hoje</CardTitle>
              <CardDescription>Próximos agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "09:00", customer: "Ana Oliveira", service: "Insufilm completo" },
                  { time: "11:30", customer: "Carlos Lima", service: "Laterais + traseiro" },
                  { time: "14:00", customer: "Lucia Ferreira", service: "Para-brisa" },
                ].map((appointment, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium text-center">{appointment.time}</div>
                    <div className="flex-1">
                      <p className="font-medium">{appointment.customer}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
