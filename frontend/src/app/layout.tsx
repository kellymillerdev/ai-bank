import './globals.css';

export const metadata = {
  title: "Kelly's AI Banker",
  description: "Kelly's AI Banker"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
