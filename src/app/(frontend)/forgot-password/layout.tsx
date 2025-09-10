import '../styles.css'

export const metadata = {
  title: 'Forgot Password - Next.js',
  description: 'Reset your password',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
