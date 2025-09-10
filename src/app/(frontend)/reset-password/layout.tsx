import '../styles.css'
import type { ReactNode } from 'react'
import { ThemeBoot } from '../theme-boot'

export const metadata = {
  title: 'Reset Password - Next.js',
  description: 'Set your new password',
}

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-background text-foreground" suppressHydrationWarning>
      <head>
        {/* Set theme instantly to avoid flash */}
        <ThemeBoot />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        {/* The skip-link targets this element */}
        <main id="main" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}
