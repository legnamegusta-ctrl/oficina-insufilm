"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { CustomerForm } from "@/components/customer-form"
import { VehicleForm } from "@/components/vehicle-form"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { customerOperations, vehicleOperations } from "@/lib/firebase-operations"
import type { Customer, Vehicle } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: "customer" | "vehicle"; item: Customer | Vehicle } | null>(
    null,
  )
  const [formLoading, setFormLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [customersData, vehiclesData] = await Promise.all([customerOperations.getAll(), vehicleOperations.getAll()])
      setCustomers(customersData)
      setVehicles(vehiclesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedCustomer) {
        await customerOperations.update(selectedCustomer.id, data)
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso",
        })
      } else {
        await customerOperations.create(data)
        toast({
          title: "Sucesso",
          description: "Cliente criado com sucesso",
        })
      }
      await loadData()
      setShowCustomerForm(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error("Error saving customer:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleVehicleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedVehicle) {
        await vehicleOperations.update(selectedVehicle.id, data)
        toast({
          title: "Sucesso",
          description: "Veículo atualizado com sucesso",
        })
      } else {
        await vehicleOperations.create(data)
        toast({
          title: "Sucesso",
          description: "Veículo adicionado com sucesso",
        })
      }
      await loadData()
      setShowVehicleForm(false)
      setSelectedVehicle(null)
    } catch (error) {
      console.error("Error saving vehicle:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar veículo",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      if (itemToDelete.type === "customer") {
        await customerOperations.delete(itemToDelete.item.id)
        toast({
          title: "Sucesso",
          description: "Cliente excluído com sucesso",
        })
      } else {
        await vehicleOperations.delete(itemToDelete.item.id)
        toast({
          title: "Sucesso",
          description: "Veículo excluído com sucesso",
        })
      }
      await loadData()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir item",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setItemToDelete(null)
    }
  }

  const customerColumns = [
    {
      key: "name",
      title: "Nome",
      sortable: true,
    },
    {
      key: "phone",
      title: "Telefone",
      render: (value: string) => value || "-",
    },
    {
      key: "email",
      title: "Email",
      render: (value: string) => value || "-",
    },
    {
      key: "vehicles",
      title: "Veículos",
      render: (_: any, customer: Customer) => {
        const customerVehicles = vehicles.filter((v) => v.customerId === customer.id)
        return (
          <Badge variant="secondary">
            {customerVehicles.length} {customerVehicles.length === 1 ? "veículo" : "veículos"}
          </Badge>
        )
      },
    },
    {
      key: "createdAt",
      title: "Cadastrado em",
      render: (value: any) => {
        if (value?.toDate) {
          return value.toDate().toLocaleDateString("pt-BR")
        }
        return "-"
      },
    },
  ]

  const vehicleColumns = [
    {
      key: "plate",
      title: "Placa",
      sortable: true,
    },
    {
      key: "model",
      title: "Modelo",
      sortable: true,
    },
    {
      key: "year",
      title: "Ano",
      render: (value: number) => value || "-",
    },
    {
      key: "color",
      title: "Cor",
      render: (value: string) => value || "-",
    },
    {
      key: "customer",
      title: "Cliente",
      render: (_: any, vehicle: Vehicle) => {
        const customer = customers.find((c) => c.id === vehicle.customerId)
        return customer?.name || "Cliente não encontrado"
      },
    },
  ]

  const getCustomerForVehicle = (customerId: string) => {
    return customers.find((c) => c.id === customerId)
  }

  return (
    <AppLayout requiredRoles={["admin", "atendente"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes & Veículos</h1>
          <p className="text-muted-foreground">Gerencie clientes e seus veículos</p>
        </div>

        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <DataTable
              data={customers}
              columns={customerColumns}
              title="Lista de Clientes"
              description="Todos os clientes cadastrados no sistema"
              searchPlaceholder="Buscar por nome, telefone ou email..."
              onAdd={() => setShowCustomerForm(true)}
              onEdit={(customer) => {
                setSelectedCustomer(customer as Customer)
                setShowCustomerForm(true)
              }}
              onDelete={(customer) => {
                setItemToDelete({ type: "customer", item: customer as Customer })
                setShowDeleteDialog(true)
              }}
              loading={loading}
              addButtonText="Novo Cliente"
            />
          </TabsContent>

          <TabsContent value="vehicles">
            <DataTable
              data={vehicles}
              columns={vehicleColumns}
              title="Lista de Veículos"
              description="Todos os veículos cadastrados no sistema"
              searchPlaceholder="Buscar por placa, modelo ou cliente..."
              onAdd={() => {
                if (customers.length === 0) {
                  toast({
                    title: "Atenção",
                    description: "É necessário ter pelo menos um cliente cadastrado para adicionar veículos",
                    variant: "destructive",
                  })
                  return
                }
                // For now, we'll need to select a customer. In a real app, you might want a customer selector
                setShowVehicleForm(true)
              }}
              onEdit={(vehicle) => {
                setSelectedVehicle(vehicle as Vehicle)
                setShowVehicleForm(true)
              }}
              onDelete={(vehicle) => {
                setItemToDelete({ type: "vehicle", item: vehicle as Vehicle })
                setShowDeleteDialog(true)
              }}
              loading={loading}
              addButtonText="Novo Veículo"
            />
          </TabsContent>
        </Tabs>

        {/* Customer Form Dialog */}
        <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
          <DialogContent className="max-w-2xl">
            <CustomerForm
              customer={selectedCustomer || undefined}
              onSubmit={handleCustomerSubmit}
              onCancel={() => {
                setShowCustomerForm(false)
                setSelectedCustomer(null)
              }}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Vehicle Form Dialog */}
        <Dialog open={showVehicleForm} onOpenChange={setShowVehicleForm}>
          <DialogContent className="max-w-2xl">
            {customers.length > 0 && (
              <VehicleForm
                vehicle={selectedVehicle || undefined}
                customerId={selectedVehicle?.customerId || customers[0].id}
                customerName={
                  selectedVehicle
                    ? getCustomerForVehicle(selectedVehicle.customerId)?.name || "Cliente"
                    : customers[0].name
                }
                onSubmit={handleVehicleSubmit}
                onCancel={() => {
                  setShowVehicleForm(false)
                  setSelectedVehicle(null)
                }}
                loading={formLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                {itemToDelete?.type === "customer"
                  ? "Tem certeza que deseja excluir este cliente? Todos os veículos associados também serão excluídos. Esta ação não pode ser desfeita."
                  : "Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."}
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
