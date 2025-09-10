import { useState, useEffect } from 'react'
import { getEmailTheme } from './theme'

export function useEmailTheme() {
  const [theme, setTheme] = useState(getEmailTheme())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Get initial theme
    const currentTheme = getEmailTheme()
    setTheme(currentTheme)

    // Listen for theme changes (if you have a theme toggle)
    const observer = new MutationObserver(() => {
      const updatedTheme = getEmailTheme()
      setTheme(updatedTheme)
    })

    // Observe changes to the document element (where CSS custom properties are set)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    return () => observer.disconnect()
  }, [])

  return { theme, isClient }
}
