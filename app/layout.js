import './globals.css'

export const metadata = {
  title: 'Externally Yours Productions, LLC',
  description: 'Professional video and film production services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/EYP Logo_New.png" />
        {/* Performance optimizations: Resource hints for faster external resource loading */}
        <link rel="dns-prefetch" href="https://www.honeybook.com" />
        <link rel="preconnect" href="https://widget.honeybook.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}

