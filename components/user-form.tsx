"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { createUser, updateUser } from "@/lib/firebase-operations"
import type { User, UserRole } from "@/lib/types"

const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "atendente", "instalador"] as const),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  user?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UserForm({ user, open, onOpenChange, onSuccess }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!user

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "atendente",
      password: "",
    },
  })

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true)

      if (isEditing && user) {
        await updateUser(user.uid, {
          name: data.name,
          role: data.role,
        })
        toast({
          title: "Usuário atualizado",
          description: "Usuário foi atualizado com sucesso.",
        })
      } else {
        if (!data.password) {
          toast({
            title: "Erro",
            description: "Senha é obrigatória para novos usuários.",
            variant: "destructive",
          })
          return
        }

        await createUser(data.email, data.password, {
          name: data.name,
          role: data.role,
        })
        toast({
          title: "Usuário criado",
          description: "Usuário foi criado com sucesso.",
        })
      }

      form.reset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar usuário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...form.register("name")} placeholder="Nome completo" />
            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="email@exemplo.com"
              disabled={isEditing} // Don't allow email changes for existing users
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={form.watch("role")} onValueChange={(value: UserRole) => form.setValue("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="atendente">Atendente</SelectItem>
                <SelectItem value="instalador">Instalador</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Senha (mínimo 6 caracteres)"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
