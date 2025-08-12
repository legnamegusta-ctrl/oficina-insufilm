"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { ScheduleForm } from "@/components/schedule-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react"
import { scheduleOperations, userOperations } from "@/lib/firebase-operations"
import { useAuth } from "@/lib/auth-context"
import type { ScheduleBlock, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function SchedulePage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleBlock | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleBlock | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [currentDate, user])

  const loadData = async () => {
    try {
      setLoading(true)

      // Calculate date range based on view mode
      let startDate: Date, endDate: Date

      if (viewMode === "day") {
        startDate = new Date(currentDate)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(currentDate)
        endDate.setHours(23, 59, 59, 999)
      } else if (viewMode === "week") {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        startDate = startOfWeek
        endDate = endOfWeek
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
      }

      const [schedulesData, usersData] = await Promise.all([
        user?.role === "instalador"
          ? scheduleOperations.getByInstaller(user.uid)
          : scheduleOperations.getByDateRange(startDate, endDate),
        userOperations.getAll(),
      ])

      setSchedules(schedulesData)
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedSchedule) {
        await scheduleOperations.update(selectedSchedule.id, data)
        toast({
          title: "Sucesso",
          description: "Agendamento atualizado com sucesso",
        })
      } else {
        await scheduleOperations.create(data)
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso",
        })
      }
      await loadData()
      setShowScheduleForm(false)
      setSelectedSchedule(null)
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar agendamento",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!scheduleToDelete) return

    try {
      await scheduleOperations.delete(scheduleToDelete.id)
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso",
      })
      await loadData()
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setScheduleToDelete(null)
    }
  }

  const getUserName = (userId: string) => {
    const foundUser = users.find((u) => u.uid === userId)
    return foundUser?.name || foundUser?.email || "Usuário não encontrado"
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)

    if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    }

    setCurrentDate(newDate)
  }

  const formatDateRange = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return `${startOfWeek.toLocaleDateString("pt-BR")} - ${endOfWeek.toLocaleDateString("pt-BR")}`
    } else {
      return currentDate.toLocaleDateString("pt-BR", { year: "numeric", month: "long" })
    }
  }

  const scheduleColumns = [
    {
      key: "title",
      title: "Título",
      sortable: true,
    },
    {
      key: "start",
      title: "Início",
      render: (value: any) => {
        if (value?.toDate) {
          return value.toDate().toLocaleString("pt-BR")
        }
        return "-"
      },
    },
    {
      key: "end",
      title: "Fim",
      render: (value: any) => {
        if (value?.toDate) {
          return value.toDate().toLocaleString("pt-BR")
        }
        return "-"
      },
    },
    {
      key: "installer",
      title: "Instalador",
      render: (_: any, schedule: ScheduleBlock) =>
        schedule.installerId ? getUserName(schedule.installerId) : "Não atribuído",
    },
    {
      key: "orderId",
      title: "OS",
      render: (value: string) => (value ? `#${value.slice(-6)}` : "-"),
    },
    {
      key: "notes",
      title: "Observações",
      render: (value: string) => value || "-",
    },
  ]

  const todaySchedules = schedules.filter((s) => {
    const scheduleDate = s.start.toDate()
    const today = new Date()
    return scheduleDate.toDateString() === today.toDateString()
  })

  const canEdit = user?.role === "admin" || user?.role === "atendente"

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">Visualize e gerencie agendamentos</p>
          </div>
          {canEdit && (
            <Button onClick={() => setShowScheduleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySchedules.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total no Período</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com OS Vinculada</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.filter((s) => s.orderId).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">{formatDateRange()}</h3>
                <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                >
                  Dia
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                >
                  Semana
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Mês
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <DataTable
          data={schedules}
          columns={scheduleColumns}
          title="Lista de Agendamentos"
          description="Agendamentos do período selecionado"
          searchPlaceholder="Buscar por título, instalador ou observações..."
          onAdd={canEdit ? () => setShowScheduleForm(true) : undefined}
          onEdit={
            canEdit
              ? (schedule) => {
                  setSelectedSchedule(schedule as ScheduleBlock)
                  setShowScheduleForm(true)
                }
              : undefined
          }
          onDelete={
            canEdit
              ? (schedule) => {
                  setScheduleToDelete(schedule as ScheduleBlock)
                  setShowDeleteDialog(true)
                }
              : undefined
          }
          loading={loading}
          addButtonText="Novo Agendamento"
        />

        {/* Schedule Form Dialog */}
        <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
          <DialogContent className="max-w-2xl">
            <ScheduleForm
              schedule={selectedSchedule || undefined}
              onSubmit={handleScheduleSubmit}
              onCancel={() => {
                setShowScheduleForm(false)
                setSelectedSchedule(null)
              }}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
