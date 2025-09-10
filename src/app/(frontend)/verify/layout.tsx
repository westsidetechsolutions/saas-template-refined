import '../styles.css'

export const metadata = {
  title: 'Email Verification - Next.js',
  description: 'Verify your email address',
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
