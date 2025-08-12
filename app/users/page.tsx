"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Shield, Users, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { UserForm } from "@/components/user-form"
import { useAuth } from "@/lib/auth-context"
import { getAllUsers, deleteUser } from "@/lib/firebase-operations"
import { toast } from "@/hooks/use-toast"
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

export default function UsersPage() {
  const { hasRole } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!hasRole(["admin"])) {
      return
    }
    loadUsers()
  }, [hasRole])

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

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId)
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
    }
    setDeleteUserId(null)
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Admin", variant: "destructive" as const },
      atendente: { label: "Atendente", variant: "default" as const },
      instalador: { label: "Instalador", variant: "secondary" as const },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.atendente
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Função",
      cell: ({ row }: { row: { original: User } }) => getRoleBadge(row.original.role),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteUserId(row.original.uid)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const roleStats = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (!hasRole(["admin"])) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso negado</h3>
          <p className="mt-1 text-sm text-gray-500">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-gray-600">Gerencie usuários e suas permissões</p>
        </div>
        <Button
          onClick={() => {
            setSelectedUser(undefined)
            setShowForm(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admin || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instaladores</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.instalador || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Lista de todos os usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            searchKey="name"
            searchPlaceholder="Buscar por nome..."
          />
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserForm user={selectedUser} open={showForm} onOpenChange={setShowForm} onSuccess={loadUsers} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDelete(deleteUserId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
