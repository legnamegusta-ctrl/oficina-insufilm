"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { InventoryForm } from "@/components/inventory-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, AlertTriangle, Package, TrendingDown } from "lucide-react"
import { inventoryOperations } from "@/lib/firebase-operations"
import type { InventoryRoll } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const [rolls, setRolls] = useState<InventoryRoll[]>([])
  const [lowStockRolls, setLowStockRolls] = useState<InventoryRoll[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoll, setSelectedRoll] = useState<InventoryRoll | null>(null)
  const [showRollForm, setShowRollForm] = useState(false)
  const [showRestockForm, setShowRestockForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rollToDelete, setRollToDelete] = useState<InventoryRoll | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rollsData, lowStockData] = await Promise.all([
        inventoryOperations.getAll(),
        inventoryOperations.getLowStock(),
      ])
      setRolls(rollsData)
      setLowStockRolls(lowStockData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do estoque",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRollSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedRoll) {
        await inventoryOperations.update(selectedRoll.id, data)
        toast({
          title: "Sucesso",
          description: "Rolo atualizado com sucesso",
        })
      } else {
        await inventoryOperations.create(data)
        toast({
          title: "Sucesso",
          description: "Rolo adicionado ao estoque",
        })
      }
      await loadData()
      setShowRollForm(false)
      setSelectedRoll(null)
    } catch (error) {
      console.error("Error saving roll:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar rolo",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleRestockSubmit = async (data: any) => {
    if (!selectedRoll) return

    try {
      setFormLoading(true)
      await inventoryOperations.restockRoll(
        selectedRoll.id,
        data.length_m_total,
        `Reabastecimento: +${data.length_m_total}m`,
      )
      toast({
        title: "Sucesso",
        description: `Rolo reabastecido com ${data.length_m_total}m`,
      })
      await loadData()
      setShowRestockForm(false)
      setSelectedRoll(null)
    } catch (error) {
      console.error("Error restocking roll:", error)
      toast({
        title: "Erro",
        description: "Erro ao reabastecer rolo",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!rollToDelete) return

    try {
      await inventoryOperations.delete(rollToDelete.id)
      toast({
        title: "Sucesso",
        description: "Rolo excluído do estoque",
      })
      await loadData()
    } catch (error) {
      console.error("Error deleting roll:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir rolo",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setRollToDelete(null)
    }
  }

  const getStockStatus = (roll: InventoryRoll) => {
    const alertThreshold = roll.lowStockAlertAt_m || 10
    const percentage = (roll.length_m_available / roll.length_m_total) * 100

    if (roll.length_m_available <= alertThreshold) {
      return { status: "low", color: "destructive", label: "Estoque Baixo" }
    } else if (percentage <= 25) {
      return { status: "warning", color: "secondary", label: "Atenção" }
    } else {
      return { status: "good", color: "secondary", label: "OK" }
    }
  }

  const rollColumns = [
    {
      key: "tone",
      title: "Tonalidade",
      sortable: true,
    },
    {
      key: "width_mm",
      title: "Largura",
      render: (value: number) => `${value}mm`,
    },
    {
      key: "stock",
      title: "Estoque",
      render: (_: any, roll: InventoryRoll) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">{roll.length_m_available.toFixed(1)}m</span>
            <span className="text-muted-foreground"> / {roll.length_m_total.toFixed(1)}m</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{
                width: `${Math.min(100, (roll.length_m_available / roll.length_m_total) * 100)}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_: any, roll: InventoryRoll) => {
        const status = getStockStatus(roll)
        return <Badge variant={status.color as any}>{status.label}</Badge>
      },
    },
    {
      key: "cost",
      title: "Custo",
      render: (value: number) => (value ? `R$ ${value.toFixed(2)}` : "-"),
    },
    {
      key: "supplier",
      title: "Fornecedor",
      render: (value: string) => value || "-",
    },
    {
      key: "lot",
      title: "Lote",
      render: (value: string) => value || "-",
    },
  ]

  const getFilteredRolls = () => {
    switch (activeTab) {
      case "low-stock":
        return lowStockRolls
      case "available":
        return rolls.filter((r) => r.length_m_available > 0)
      case "empty":
        return rolls.filter((r) => r.length_m_available === 0)
      default:
        return rolls
    }
  }

  const totalValue = rolls.reduce((sum, roll) => sum + (roll.cost || 0), 0)
  const totalMeters = rolls.reduce((sum, roll) => sum + roll.length_m_available, 0)

  return (
    <AppLayout requiredRoles={["admin", "atendente"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
            <p className="text-muted-foreground">Gerencie rolos e tonalidades</p>
          </div>
          <Button onClick={() => setShowRollForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Rolo
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Rolos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rolls.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metros Disponíveis</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMeters.toFixed(1)}m</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lowStockRolls.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockRolls.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alerta de Estoque Baixo
              </CardTitle>
              <CardDescription>
                {lowStockRolls.length} {lowStockRolls.length === 1 ? "rolo precisa" : "rolos precisam"} ser
                reabastecidos
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="available">Disponíveis</TabsTrigger>
            <TabsTrigger value="low-stock">Estoque Baixo</TabsTrigger>
            <TabsTrigger value="empty">Esgotados</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <DataTable
              data={getFilteredRolls()}
              columns={rollColumns}
              title="Rolos em Estoque"
              description="Controle de tonalidades e quantidades"
              searchPlaceholder="Buscar por tonalidade, fornecedor ou lote..."
              onAdd={() => setShowRollForm(true)}
              onEdit={(roll) => {
                setSelectedRoll(roll as InventoryRoll)
                setShowRollForm(true)
              }}
              onDelete={(roll) => {
                setRollToDelete(roll as InventoryRoll)
                setShowDeleteDialog(true)
              }}
              onView={(roll) => {
                setSelectedRoll(roll as InventoryRoll)
                setShowRestockForm(true)
              }}
              loading={loading}
              addButtonText="Novo Rolo"
            />
          </TabsContent>
        </Tabs>

        {/* Roll Form Dialog */}
        <Dialog open={showRollForm} onOpenChange={setShowRollForm}>
          <DialogContent className="max-w-2xl">
            <InventoryForm
              roll={selectedRoll || undefined}
              onSubmit={handleRollSubmit}
              onCancel={() => {
                setShowRollForm(false)
                setSelectedRoll(null)
              }}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Restock Form Dialog */}
        <Dialog open={showRestockForm} onOpenChange={setShowRestockForm}>
          <DialogContent className="max-w-2xl">
            <InventoryForm
              roll={selectedRoll || undefined}
              onSubmit={handleRestockSubmit}
              onCancel={() => {
                setShowRestockForm(false)
                setSelectedRoll(null)
              }}
              loading={formLoading}
              isRestock={true}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este rolo do estoque? Esta ação não pode ser desfeita.
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
