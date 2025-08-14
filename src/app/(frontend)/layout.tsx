// src/app/(frontend)/layout.tsx
import './styles.css'
import type { ReactNode } from 'react'
import { ThemeBoot } from './theme-boot'
import { Nav } from './components/layout/nav'
import { Footer } from './components/layout/footer'
import { SkipLink } from './components/a11y/SkipLink'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <head>
        {/* Set theme instantly to avoid flash */}
        <ThemeBoot />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <SkipLink />
        <Nav />
        {/* The skip-link targets this element */}
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
