"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { ServiceForm } from "@/components/service-form"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Wrench, DollarSign, ToggleLeft, ToggleRight } from "lucide-react"
import { serviceOperations } from "@/lib/firebase-operations"
import type { ServiceItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const servicesData = await serviceOperations.getAll()
      setServices(servicesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedService) {
        await serviceOperations.update(selectedService.id, data)
        toast({
          title: "Sucesso",
          description: "Serviço atualizado com sucesso",
        })
      } else {
        await serviceOperations.create(data)
        toast({
          title: "Sucesso",
          description: "Serviço criado com sucesso",
        })
      }
      await loadData()
      setShowServiceForm(false)
      setSelectedService(null)
    } catch (error) {
      console.error("Error saving service:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar serviço",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      await serviceOperations.toggleActive(service.id)
      toast({
        title: "Sucesso",
        description: `Serviço ${service.active ? "desativado" : "ativado"} com sucesso`,
      })
      await loadData()
    } catch (error) {
      console.error("Error toggling service:", error)
      toast({
        title: "Erro",
        description: "Erro ao alterar status do serviço",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!serviceToDelete) return

    try {
      await serviceOperations.delete(serviceToDelete.id)
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso",
      })
      await loadData()
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir serviço",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setServiceToDelete(null)
    }
  }

  const serviceColumns = [
    {
      key: "name",
      title: "Nome do Serviço",
      sortable: true,
    },
    {
      key: "basePrice",
      title: "Preço Base",
      render: (value: number) => `R$ ${value.toFixed(2)}`,
    },
    {
      key: "description",
      title: "Descrição",
      render: (value: string) => value || "-",
    },
    {
      key: "active",
      title: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "secondary" : "outline"}>{value ? "Ativo" : "Inativo"}</Badge>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, service: ServiceItem) => (
        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(service)}>
          {service.active ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      ),
    },
  ]

  const getFilteredServices = () => {
    switch (activeTab) {
      case "active":
        return services.filter((s) => s.active)
      case "inactive":
        return services.filter((s) => !s.active)
      default:
        return services
    }
  }

  const activeServices = services.filter((s) => s.active)
  const averagePrice = services.length > 0 ? services.reduce((sum, s) => sum + s.basePrice, 0) / services.length : 0

  return (
    <AppLayout requiredRoles={["admin", "atendente"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
            <p className="text-muted-foreground">Tabela de preços e serviços</p>
          </div>
          <Button onClick={() => setShowServiceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
              <Badge variant="secondary">{activeServices.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeServices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {averagePrice.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maior Preço</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {services.length > 0 ? Math.max(...services.map((s) => s.basePrice)).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Inativos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <DataTable
              data={getFilteredServices()}
              columns={serviceColumns}
              title="Lista de Serviços"
              description="Serviços disponíveis e preços"
              searchPlaceholder="Buscar por nome ou descrição..."
              onAdd={() => setShowServiceForm(true)}
              onEdit={(service) => {
                setSelectedService(service as ServiceItem)
                setShowServiceForm(true)
              }}
              onDelete={(service) => {
                setServiceToDelete(service as ServiceItem)
                setShowDeleteDialog(true)
              }}
              loading={loading}
              addButtonText="Novo Serviço"
            />
          </TabsContent>
        </Tabs>

        {/* Service Form Dialog */}
        <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
          <DialogContent className="max-w-2xl">
            <ServiceForm
              service={selectedService || undefined}
              onSubmit={handleServiceSubmit}
              onCancel={() => {
                setShowServiceForm(false)
                setSelectedService(null)
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
                Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
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
