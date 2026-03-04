"use client"

import { useEffect } from "react"
import { useThemeStore, applyTheme } from "@/lib/theme"

export function ThemeInitializer() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return null
}
