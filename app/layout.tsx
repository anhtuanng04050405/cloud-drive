import './globals.css'

export const metadata = { title: 'Cloud Drive', description: 'Luu tru file ca nhan' }

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang='vi'>
      <body>{props.children}</body>
    </html>
  )
}