import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function AdminRegisterSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Mail className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Confirma tu Email</h1>
        <p className="text-muted-foreground">
          Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada y confirma tu cuenta para
          poder acceder al panel de administración.
        </p>
        <Button asChild>
          <Link href="/auth/admin-login">Volver al Login</Link>
        </Button>
      </div>
    </div>
  )
}
