'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/support', label: 'Support' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground hover:text-brand transition-colors"
            aria-label="Go to homepage"
          >
            MyBrand
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
                  pathname === link.href && 'text-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm">
              Log in
            </Button>
            <Button size="sm" className="shadow-soft hover:shadow-lift">
              Get Started
            </Button>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px]">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-foreground hover:text-brand transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 flex gap-2">
            <Button variant="outline" className="flex-1">
              Log in
            </Button>
            <Button className="flex-1 shadow-soft hover:shadow-lift">Get Started</Button>
          </div>

          <button
            className="mt-2 inline-flex items-center gap-2 self-start text-sm text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
            onClick={() => {
              // Close by clicking outside or pressing escape; optional explicit close:
              const el = document.querySelector<HTMLElement>(
                '[data-state="open"][data-dismiss="sheet"]',
              )
              el?.click()
            }}
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
