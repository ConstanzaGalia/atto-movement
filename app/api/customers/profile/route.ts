import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get customer profile
    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      // If customer doesn't exist, create one
      if (error.code === "PGRST116") {
        const { data: newCustomer, error: insertError } = await supabase
          .from("customers")
          .insert({
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
          })
          .select()
          .single()

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json(newCustomer)
      }

      // Si la tabla no existe o hay error de schema, devolver al menos datos del usuario auth para que se vea el email
      const isTableMissing =
        error.message?.includes("schema cache") ||
        error.message?.includes("relation") ||
        error.code === "42P01"
      if (isTableMissing) {
        const fallback = {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name ?? null,
          phone: user.user_metadata?.phone ?? null,
          shipping_address: null as string | null,
          fromAuthOnly: true,
        }
        return NextResponse.json(fallback)
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer profile:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, phone, shipping_address } = body

    // Update customer profile
    const { data: customer, error } = await supabase
      .from("customers")
      .update({
        full_name: full_name || null,
        phone: phone || null,
        shipping_address: shipping_address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      const isTableMissing =
        error.message?.includes("schema cache") ||
        error.message?.includes("relation") ||
        error.code === "42P01"
      if (isTableMissing) {
        return NextResponse.json(
          {
            error:
              "La tabla de clientes no existe en la base de datos. Ejecutá el script scripts/021_create_customers_table.sql en Supabase (SQL Editor) y luego scripts/023_create_customers_rls.sql para poder guardar el perfil.",
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error updating customer profile:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
