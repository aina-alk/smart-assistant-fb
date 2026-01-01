/**
 * Layout pour les pages d'inscription et d'attente
 * Design simple avec logo et fond gradient
 */

import { Stethoscope } from 'lucide-react';

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header avec logo */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Selav</h1>
              <p className="text-xs text-muted-foreground">
                Votre assistant IA pour la documentation médicale
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
