"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { createClient } from "@/lib/supabase/client"
import {
  AdminPageHeader,
  AdminKpiStrip,
  AdminDataTable,
  AdminTableHead,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui"

type Expense = {
  id: string
  description: string
  amount: number
  expense_date: string
  notes: string | null
}

export function ExpensesManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [sales, setSales] = useState<
    Array<{ total_amount: number; created_at: string; payment_status?: string; status?: string }>
  >([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const supabase = createClient()

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 3 }, (_, i) => (currentYear - i).toString())
  }, [])

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  const fetchExpenses = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false })
    if (data) setExpenses(data)
    setIsLoading(false)
  }

  const fetchSales = async () => {
    const { data } = await supabase
      .from("orders")
      .select("total_amount, created_at, payment_status, status")
      .order("created_at", { ascending: false })
    if (data) setSales(data)
  }

  useEffect(() => {
    fetchExpenses()
    fetchSales()
  }, [])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.expense_date)
      return (
        expenseDate.getFullYear().toString() === selectedYear &&
        (expenseDate.getMonth() + 1).toString() === selectedMonth
      )
    })
  }, [expenses, selectedYear, selectedMonth])

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (sale.payment_status && sale.payment_status !== "paid") return false
      if (sale.status === "cancelled") return false
      const saleDate = new Date(sale.created_at)
      return (
        saleDate.getFullYear().toString() === selectedYear &&
        (saleDate.getMonth() + 1).toString() === selectedMonth
      )
    })
  }, [sales, selectedYear, selectedMonth])

  const monthlyExpenses = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    [filteredExpenses]
  )
  const monthlySales = useMemo(
    () => filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0),
    [filteredSales]
  )
  const monthlyBalance = monthlySales - monthlyExpenses

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const expenseData = {
      description: formData.get("description") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      expense_date: formData.get("expense_date") as string,
      notes: (formData.get("notes") as string) || null,
    }
    try {
      if (editingExpense) {
        await supabase.from("expenses").update(expenseData).eq("id", editingExpense.id)
      } else {
        await supabase.from("expenses").insert(expenseData)
      }
      await fetchExpenses()
      setIsDialogOpen(false)
      setEditingExpense(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // FINANCE"
        title="Ingresos y gastos"
        description="Balance mensual: ventas pagadas vs egresos."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="border border-black bg-black px-3 py-2 font-label-caps text-white hover:bg-transparent hover:text-black"
              >
                + Gasto
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-none max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display uppercase">
                  {editingExpense ? "Editar gasto" : "Nuevo gasto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-technical-micro text-outline uppercase block mb-1">Descripción</label>
                  <Input name="description" required defaultValue={editingExpense?.description} className="rounded-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-technical-micro text-outline uppercase block mb-1">Monto</label>
                    <Input name="amount" type="number" step="0.01" required defaultValue={editingExpense?.amount} className="rounded-none" />
                  </div>
                  <div>
                    <label className="font-technical-micro text-outline uppercase block mb-1">Fecha</label>
                    <Input
                      name="expense_date"
                      type="date"
                      required
                      defaultValue={editingExpense?.expense_date || new Date().toISOString().split("T")[0]}
                      className="rounded-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-technical-micro text-outline uppercase block mb-1">Notas</label>
                  <Textarea name="notes" rows={2} defaultValue={editingExpense?.notes || ""} className="rounded-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsDialogOpen(false)} className="border border-black px-3 py-2 font-label-caps">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-black text-white px-3 py-2 font-label-caps disabled:opacity-50">
                    {isSubmitting ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="rounded-none w-full sm:w-32 font-technical-data">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="rounded-none w-full sm:w-40 font-technical-data">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isLoading && (
        <AdminKpiStrip
          items={[
            { label: "Ingresos pagos", value: `$ ${monthlySales.toLocaleString("es-AR")}` },
            { label: "Egresos", value: `$ ${monthlyExpenses.toLocaleString("es-AR")}` },
            {
              label: "Balance",
              value: `$ ${monthlyBalance.toLocaleString("es-AR")}`,
              hint: months.find((m) => m.value === selectedMonth)?.label,
            },
          ]}
        />
      )}

      {isLoading ? (
        <p className="font-technical-data text-atto-secondary uppercase">Cargando…</p>
      ) : (
        <div className="md:hidden space-y-3">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="border border-outline-variant bg-white p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold uppercase tracking-tight">{expense.description}</p>
                  <p className="font-technical-micro text-outline mt-1">
                    {new Date(expense.expense_date).toLocaleDateString("es-AR")}
                  </p>
                  {expense.notes && (
                    <p className="font-technical-micro text-atto-secondary normal-case mt-1">{expense.notes}</p>
                  )}
                </div>
                <p className="font-technical-data font-bold shrink-0">
                  - $ {Number(expense.amount).toLocaleString("es-AR")}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="font-technical-micro uppercase border-b border-black"
                  onClick={() => {
                    setEditingExpense(expense)
                    setIsDialogOpen(true)
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="font-technical-micro uppercase text-atto-secondary border-b border-outline"
                  onClick={() => {
                    setExpenseToDelete(expense)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>

        <AdminDataTable desktopOnly>
          <AdminTableHead>
            <AdminTh>Fecha</AdminTh>
            <AdminTh>Descripción</AdminTh>
            <AdminTh>Monto</AdminTh>
            <AdminTh></AdminTh>
          </AdminTableHead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-surface-container-low/80">
                <AdminTd>{new Date(expense.expense_date).toLocaleDateString("es-AR")}</AdminTd>
                <AdminTd>
                  <p className="font-bold uppercase">{expense.description}</p>
                  {expense.notes && <p className="text-atto-secondary normal-case">{expense.notes}</p>}
                </AdminTd>
                <AdminTd>- $ {Number(expense.amount).toLocaleString("es-AR")}</AdminTd>
                <AdminTd>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      className="font-technical-micro uppercase border-b border-black"
                      onClick={() => {
                        setEditingExpense(expense)
                        setIsDialogOpen(true)
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="font-technical-micro uppercase text-atto-secondary border-b border-outline"
                      onClick={() => {
                        setExpenseToDelete(expense)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      Borrar
                    </button>
                  </div>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminDataTable>
      )}
      {!isLoading && filteredExpenses.length === 0 && (
        <p className="font-technical-data text-atto-secondary uppercase">Sin gastos en el período</p>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">¿Eliminar gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará “{expenseToDelete?.description}”. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!expenseToDelete) return
                await supabase.from("expenses").delete().eq("id", expenseToDelete.id)
                await fetchExpenses()
                setIsDeleteDialogOpen(false)
                setExpenseToDelete(null)
              }}
              className="bg-black"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
