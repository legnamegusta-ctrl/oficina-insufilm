"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { UserForm } from "@/components/user-form"
import { Settings, Users, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getAllUsers, deleteUser } from "@/lib/firebase-operations"
import type { User } from "@/lib/types"
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
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreateUser = () => {
    setSelectedUser(undefined)
    setUserFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setUserFormOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete.uid)
      toast({
        title: "Usuário excluído",
        description: "Usuário foi excluído com sucesso.",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "atendente":
        return "default"
      case "instalador":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "atendente":
        return "Atendente"
      case "instalador":
        return "Instalador"
      default:
        return role
    }
  }

  const userColumns = [
    {
      key: "name" as keyof User,
      label: "Nome",
      render: (user: User) => user.name || user.email,
    },
    {
      key: "email" as keyof User,
      label: "Email",
    },
    {
      key: "role" as keyof User,
      label: "Função",
      render: (user: User) => <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>,
    },
    {
      key: "createdAt" as keyof User,
      label: "Criado em",
      render: (user: User) => {
        if (user.createdAt && typeof user.createdAt.toDate === "function") {
          return user.createdAt.toDate().toLocaleDateString("pt-BR")
        }
        return "-"
      },
    },
    {
      key: "actions" as keyof User,
      label: "Ações",
      render: (user: User) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout requiredRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Configurações do sistema e usuários</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Gerenciar Usuários
              </div>
              <Button onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </CardTitle>
            <CardDescription>Gerencie usuários do sistema e suas permissões</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={userColumns}
              loading={loading}
              searchKey="name"
              searchPlaceholder="Buscar usuários..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>Configurações da oficina e sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Funcionalidade em desenvolvimento...</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserForm user={selectedUser} open={userFormOpen} onOpenChange={setUserFormOpen} onSuccess={loadUsers} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "{userToDelete?.name || userToDelete?.email}"? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
