import './globals.css'

export const metadata = {
  title: 'Portfolio of Zhicheng',
  description: 'Created by ZI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
