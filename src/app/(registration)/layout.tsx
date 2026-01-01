/**
 * Layout pour les pages d'inscription et d'attente
 * Design simple avec logo et fond gradient
 */

import { BrandMark } from '@/components/brand';

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header avec logo */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <BrandMark
            size="lg"
            showTagline
            tagline="Votre assistant IA pour la documentation médicale"
          />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
