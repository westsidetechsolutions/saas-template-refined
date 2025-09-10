// Theme utility for email templates
// Extracts colors from CSS custom properties defined in styles.css

interface EmailTheme {
  colors: {
    brand: string
    brandForeground: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    border: string
    ring: string
  }
  fonts: {
    sans: string
  }
}

// Function to get computed CSS custom property value
function getCSSVariable(name: string): string {
  const fallbackColors: Record<string, string> = {
    '--brand': 'hsl(280 85% 65%)',
    '--brand-foreground': 'hsl(0 0% 100%)',
    '--background': 'hsl(0 0% 100%)',
    '--foreground': 'hsl(280 20% 15%)',
    '--muted': 'hsl(280 15% 95%)',
    '--muted-foreground': 'hsl(280 25% 45%)',
    '--border': 'hsl(280 20% 90%)',
    '--ring': 'hsl(280 85% 65%)',
  }

  if (typeof window === 'undefined') {
    // Server-side fallback - return the HSL values from your styles.css
    return fallbackColors[name] || '#000000'
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  // If we get a raw HSL value (like "280 15% 95%"), wrap it in hsl()
  if (value && !value.startsWith('hsl(') && !value.startsWith('#')) {
    return `hsl(${value})`
  }

  return value || fallbackColors[name] || '#000000'
}

// Convert HSL to hex for email compatibility
function hslToHex(hsl: string): string {
  if (!hsl.startsWith('hsl(')) return hsl

  // Extract HSL values
  const match = hsl.match(/hsl\(([^)]+)\)/)
  if (!match) return hsl

  // Parse HSL values more robustly
  const parts = match[1].split(' ').filter((part) => part.trim() !== '')
  if (parts.length < 3) return hsl

  const h = parseFloat(parts[0])
  const s = parseFloat(parts[1])
  const l = parseFloat(parts[2])

  // Convert HSL to RGB
  const hue = h / 360
  const saturation = s / 100
  const lightness = l / 100

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((hue * 6) % 2) - 1))
  const m = lightness - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (hue < 1 / 6) {
    r = c
    g = x
    b = 0
  } else if (hue < 2 / 6) {
    r = x
    g = c
    b = 0
  } else if (hue < 3 / 6) {
    r = 0
    g = c
    b = x
  } else if (hue < 4 / 6) {
    r = 0
    g = x
    b = c
  } else if (hue < 5 / 6) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  const rgb = [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]

  // Ensure values are within valid range
  const validRgb = rgb.map((n) => Math.max(0, Math.min(255, n)))

  const hex = `#${validRgb.map((n) => n.toString(16).padStart(2, '0')).join('')}`

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('HSL to Hex conversion:', { hsl, h, s, l, rgb: validRgb, hex })
  }

  return hex
}

export function getEmailTheme(): EmailTheme {
  // Helper function to ensure we get valid hex colors with specific fallbacks
  const safeHex = (color: string, fallback: string): string => {
    const hex = hslToHex(color)
    // If conversion failed or resulted in invalid hex, use fallback
    if (!hex.startsWith('#') || hex === '#NaNNaNNaN' || hex.length !== 7) {
      console.warn('Invalid color conversion:', color, '->', hex, 'using fallback:', fallback)
      return fallback
    }
    return hex
  }

  const brand = safeHex(getCSSVariable('--brand'), '#a855f7')
  const brandForeground = safeHex(getCSSVariable('--brand-foreground'), '#ffffff')
  const background = safeHex(getCSSVariable('--background'), '#ffffff')
  const foreground = safeHex(getCSSVariable('--foreground'), '#2d1b69')
  const muted = safeHex(getCSSVariable('--muted'), '#f3f1ff')
  const mutedForeground = safeHex(getCSSVariable('--muted-foreground'), '#7c3aed')
  const border = safeHex(getCSSVariable('--border'), '#e9d5ff')
  const ring = safeHex(getCSSVariable('--ring'), '#a855f7')

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Email Theme Debug:', {
      brand,
      brandForeground,
      background,
      foreground,
      muted,
      mutedForeground,
      border,
      ring,
    })
  }

  return {
    colors: {
      brand,
      brandForeground,
      background,
      foreground,
      muted,
      mutedForeground,
      border,
      ring,
    },
    fonts: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  }
}

// Predefined theme for server-side rendering (matches your styles.css)
export const defaultEmailTheme: EmailTheme = {
  colors: {
    brand: '#a855f7', // hsl(280 85% 65%) - Bright purple
    brandForeground: '#ffffff', // hsl(0 0% 100%)
    background: '#ffffff', // hsl(0 0% 100%)
    foreground: '#2d1b69', // hsl(280 20% 15%) - Dark purple-gray
    muted: '#f3f1ff', // hsl(280 15% 95%) - Very light purple
    mutedForeground: '#7c3aed', // hsl(280 25% 45%) - Medium purple-gray
    border: '#e9d5ff', // hsl(280 20% 90%) - Light purple border
    ring: '#a855f7', // hsl(280 85% 65%) - Bright purple ring
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
}
