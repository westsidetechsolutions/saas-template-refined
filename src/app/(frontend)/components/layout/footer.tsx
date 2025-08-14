import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand / blurb */}
          <div>
            <div className="text-lg font-semibold">MyBrand</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-prose">
              Build stunning, accessible UIs fast with a tokenized system and production-ready
              components.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-12">
            <FooterColumn
              title="Product"
              links={[
                { href: '/#features', label: 'Features' },
                { href: '/#pricing', label: 'Pricing' },
                { href: '/#faq', label: 'FAQ' },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
                { href: '/legal/privacy', label: 'Privacy' },
              ]}
            />
          </div>

          {/* Callout / signup placeholder */}
          <div>
            <div className="text-lg font-semibold">Ready to get started?</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Ship beautiful pages in hours, not weeks. No extra subscriptions required.
            </p>
            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-lg bg-brand px-5 py-3 text-sm font-medium text-brand-foreground shadow-soft transition-shadow hover:shadow-lift"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} MyBrand. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/legal/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/legal/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
