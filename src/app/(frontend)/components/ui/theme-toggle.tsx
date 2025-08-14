'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const stored = (localStorage.getItem('theme') as 'light' | 'dark' | null) || null
    const initial = stored || system
    setTheme(initial)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const el = document.documentElement
    if (theme === 'dark') el.classList.add('dark')
    else el.classList.remove('dark')
    el.style.colorScheme = theme
    localStorage.setItem('theme', theme)
  }, [mounted, theme])

  if (!mounted) return null

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
