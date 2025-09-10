import '../styles.css'

export const metadata = {
  title: 'Cancel Email Change - Next.js',
  description: 'Cancel your email change request',
}

export default function CancelEmailChangeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
