"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const promptEvent = e as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setDeferredPrompt(promptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler as EventListener)

    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    } else {
      alert("Para instalar, usa el menú de tu navegador → 'Agregar a pantalla de inicio'")
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={handleInstall}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-all hover:scale-110 active:scale-95"
        title="Instalar app"
      >
        <Download className="h-6 w-6" />
      </button>
    </div>
  )
}