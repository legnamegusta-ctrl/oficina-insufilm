"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { CashForm } from "@/components/cash-form"
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
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { cashOperations } from "@/lib/firebase-operations"
import { useAuth } from "@/lib/auth-context"
import type { CashEntry } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function CashboxPage() {
  const { user } = useAuth()
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<CashEntry | null>(null)
  const [showCashForm, setShowCashForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<CashEntry | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [summary, setSummary] = useState({
    totalReceita: 0,
    totalDespesa: 0,
    balance: 0,
    byMethod: {} as Record<string, number>,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Get current month data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      const [entriesData, summaryData] = await Promise.all([
        cashOperations.getAll(),
        cashOperations.getSummaryByPeriod(startOfMonth, endOfMonth),
      ])

      setCashEntries(entriesData)
      setSummary(summaryData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do caixa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCashSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      const entryData = {
        ...data,
        by: user?.uid || "system",
      }

      if (selectedEntry) {
        await cashOperations.update(selectedEntry.id, entryData)
        toast({
          title: "Sucesso",
          description: "Lançamento atualizado com sucesso",
        })
      } else {
        await cashOperations.create(entryData)
        toast({
          title: "Sucesso",
          description: "Lançamento registrado com sucesso",
        })
      }
      await loadData()
      setShowCashForm(false)
      setSelectedEntry(null)
    } catch (error) {
      console.error("Error saving cash entry:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar lançamento",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!entryToDelete) return

    try {
      await cashOperations.delete(entryToDelete.id)
      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso",
      })
      await loadData()
    } catch (error) {
      console.error("Error deleting cash entry:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir lançamento",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setEntryToDelete(null)
    }
  }

  const getFilteredEntries = () => {
    switch (activeTab) {
      case "receita":
        return cashEntries.filter((e) => e.type === "receita")
      case "despesa":
        return cashEntries.filter((e) => e.type === "despesa")
      default:
        return cashEntries
    }
  }

  const cashColumns = [
    {
      key: "type",
      title: "Tipo",
      render: (value: string) => (
        <Badge variant={value === "receita" ? "secondary" : "destructive"}>
          {value === "receita" ? "Receita" : "Despesa"}
        </Badge>
      ),
    },
    {
      key: "amount",
      title: "Valor",
      render: (value: number, entry: CashEntry) => (
        <span className={entry.type === "receita" ? "text-green-600" : "text-red-600"}>
          {entry.type === "receita" ? "+" : "-"}R$ {value.toFixed(2)}
        </span>
      ),
    },
    {
      key: "method",
      title: "Forma de Pagamento",
      render: (value: string) => {
        const methods = {
          dinheiro: "Dinheiro",
          pix: "PIX",
          credito: "Cartão de Crédito",
          debito: "Cartão de Débito",
          outro: "Outro",
        }
        return methods[value as keyof typeof methods] || value || "-"
      },
    },
    {
      key: "refOrderId",
      title: "OS",
      render: (value: string) => (value ? `#${value.slice(-6)}` : "-"),
    },
    {
      key: "notes",
      title: "Observações",
      render: (value: string) => value || "-",
    },
    {
      key: "at",
      title: "Data/Hora",
      render: (value: any) => {
        if (value?.toDate) {
          return value.toDate().toLocaleString("pt-BR")
        }
        return "-"
      },
    },
  ]

  return (
    <AppLayout requiredRoles={["admin", "atendente"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
            <p className="text-muted-foreground">Controle financeiro e recebimentos</p>
          </div>
          <Button onClick={() => setShowCashForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {summary.totalReceita.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {summary.totalDespesa.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {summary.balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Lançamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cashEntries.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Summary */}
        {Object.keys(summary.byMethod).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Forma de Pagamento</CardTitle>
              <CardDescription>Valores recebidos no mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(summary.byMethod).map(([method, amount]) => (
                  <div key={method} className="text-center">
                    <div className="text-sm text-muted-foreground capitalize">{method}</div>
                    <div className="text-lg font-semibold">R$ {amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <DataTable
              data={getFilteredEntries()}
              columns={cashColumns}
              title="Movimentação Financeira"
              description="Receitas e despesas registradas"
              searchPlaceholder="Buscar por valor, observações ou OS..."
              onAdd={() => setShowCashForm(true)}
              onEdit={(entry) => {
                setSelectedEntry(entry as CashEntry)
                setShowCashForm(true)
              }}
              onDelete={(entry) => {
                setEntryToDelete(entry as CashEntry)
                setShowDeleteDialog(true)
              }}
              loading={loading}
              addButtonText="Novo Lançamento"
            />
          </TabsContent>
        </Tabs>

        {/* Cash Form Dialog */}
        <Dialog open={showCashForm} onOpenChange={setShowCashForm}>
          <DialogContent className="max-w-2xl">
            <CashForm
              cashEntry={selectedEntry || undefined}
              onSubmit={handleCashSubmit}
              onCancel={() => {
                setShowCashForm(false)
                setSelectedEntry(null)
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
                Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
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
