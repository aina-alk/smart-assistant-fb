import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Super Assistant Médical',
  description: 'Application web pour chirurgiens ORL - génération de CRC via dictée vocale et IA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
