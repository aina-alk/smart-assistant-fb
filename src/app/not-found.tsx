import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Page introuvable</h2>

        <p className="mt-4 max-w-md text-muted-foreground">
          La page que vous recherchez n&apos;existe pas ou a été déplacée. Vérifiez l&apos;URL ou
          retournez à l&apos;accueil.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild>
            <Link href="/medecin">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/60">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez le support.
        </p>
      </div>
    </div>
  );
}
