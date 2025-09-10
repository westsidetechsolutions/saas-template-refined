import '../styles.css'

export const metadata = {
  title: 'Verify Email Change - Next.js',
  description: 'Verify your new email address',
}

export default function VerifyEmailChangeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
