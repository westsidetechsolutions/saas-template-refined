import '../styles.css'

export const metadata = {
  title: 'Check Your Email - Next.js',
  description: 'Please check your email to verify your account',
}

export default function CheckEmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
