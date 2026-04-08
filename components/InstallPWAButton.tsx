"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setIsInstallable(false)
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