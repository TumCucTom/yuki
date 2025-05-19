import React from 'react';
import '@fontsource/titillium-web/300.css';
import '@fontsource/titillium-web/400.css'; 
import '@fontsource/titillium-web/600.css';
import '@fontsource/titillium-web/700.css';
import "./globals.css";

export const metadata = {
  title: 'Yuki ML - F1 2025 Predictions',
  description: 'Advanced machine learning predictions for the 2025 Formula 1 season',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
