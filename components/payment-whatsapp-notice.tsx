import { WHATSAPP_URL } from "@/lib/constants"
import { MessageCircle } from "lucide-react"

type PaymentWhatsAppNoticeProps = {
  className?: string
}

export function PaymentWhatsAppNotice({ className = "" }: PaymentWhatsAppNoticeProps) {
  return (
    <div
      className={`border border-surface-container-high bg-surface-container-low p-3 flex gap-3 ${className}`}
    >
      <MessageCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#25D366]" />
      <div>
        <p className="font-technical-micro text-atto-secondary mb-1">
          Para coordinar el pago, contactanos por WhatsApp.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label-caps text-black border-b border-black pb-0.5 inline-block"
        >
          Contactar por WhatsApp →
        </a>
      </div>
    </div>
  )
}
