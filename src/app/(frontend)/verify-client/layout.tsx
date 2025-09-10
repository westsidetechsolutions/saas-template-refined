import '../styles.css'

export const metadata = {
  title: 'Email Verification - Next.js',
  description: 'Verifying your email address',
}

export default function VerifyClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
