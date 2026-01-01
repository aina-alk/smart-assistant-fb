'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthorizationStatus } from '@/lib/hooks/use-authorization-status';
import {
  Mic,
  FileText,
  Zap,
  Clock,
  Shield,
  ArrowRight,
  Check,
  Play,
  Sparkles,
  BrainCircuit,
  ClipboardCheck,
  Loader2,
} from 'lucide-react';
import { BrandMark } from '@/components/brand';

export default function LandingPage() {
  const router = useRouter();
  const { redirectTo, isLoading, state } = useAuthorizationStatus('/');

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isLoading, redirectTo, router]);

  // Show loader only for authenticated users being redirected
  if (isLoading || (redirectTo && state !== 'unauthenticated')) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size="md" />
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Comment ça marche
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Commencer</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Révolutionnez votre documentation médicale
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Dictez pendant que vous examinez.{' '}
              <span className="text-primary">L&apos;IA rédige</span> pendant que vous passez au
              patient suivant.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              L&apos;assistant IA qui écoute, comprend, rédige et code vos consultations. Gagnez 500
              heures par an sur votre documentation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="gap-2 text-lg px-8" asChild>
                <Link href="/login">
                  <Play className="h-5 w-5" />
                  Essayer gratuitement
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8" asChild>
                <a href="#how-it-works">
                  Voir la démo
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Sans engagement
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Installation en 2 min
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Support français
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">500h</div>
              <div className="text-sm text-muted-foreground mt-1">économisées par an</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">5 min</div>
              <div className="text-sm text-muted-foreground mt-1">au lieu de 15 min</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground mt-1">précision transcription</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">conforme RGPD</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">
              Fonctionnalités
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin pour documenter efficacement
            </h2>
            <p className="text-muted-foreground text-lg">
              Une suite complète d&apos;outils pensés par et pour les praticiens
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Dictée vocale intelligente</CardTitle>
                <CardDescription>
                  Parlez naturellement pendant l&apos;examen. Notre IA transcrit en temps réel avec
                  une précision de 95%.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Génération IA de CRC</CardTitle>
                <CardDescription>
                  Transformez votre dictée en compte-rendu structuré et professionnel en quelques
                  secondes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Codage automatique</CardTitle>
                <CardDescription>
                  CIM-10, CCAM, NGAP : l&apos;IA suggère les codes adaptés pour optimiser votre
                  facturation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Documents automatisés</CardTitle>
                <CardDescription>
                  Ordonnances, courriers de liaison, certificats : générés automatiquement depuis
                  votre consultation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Intégration FHIR</CardTitle>
                <CardDescription>
                  Données patients centralisées et interopérables. Compatible avec les standards
                  internationaux.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sécurité maximale</CardTitle>
                <CardDescription>
                  Hébergement HDS, chiffrement bout-en-bout, conformité RGPD. Vos données sont en
                  sécurité.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">
              Comment ça marche
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              3 étapes pour transformer votre pratique
            </h2>
            <p className="text-muted-foreground text-lg">
              Un workflow simple et intuitif, pensé pour s&apos;intégrer naturellement à votre
              consultation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative">
              <div className="text-8xl font-bold text-primary/10 absolute -top-4 -left-4">1</div>
              <Card className="relative bg-background">
                <CardContent className="pt-8">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Dictez</h3>
                  <p className="text-muted-foreground">
                    Activez la dictée et parlez naturellement pendant votre examen. L&apos;IA
                    transcrit en temps réel.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="text-8xl font-bold text-primary/10 absolute -top-4 -left-4">2</div>
              <Card className="relative bg-background">
                <CardContent className="pt-8">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Validez</h3>
                  <p className="text-muted-foreground">
                    L&apos;IA génère un CRC structuré. Relisez, ajustez si nécessaire, et validez en
                    un clic.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="text-8xl font-bold text-primary/10 absolute -top-4 -left-4">3</div>
              <Card className="relative bg-background">
                <CardContent className="pt-8">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Exportez</h3>
                  <p className="text-muted-foreground">
                    CRC, ordonnances, courriers : tout est prêt. Imprimez ou envoyez directement au
                    patient.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Prêt à révolutionner votre documentation ?
            </h2>
            <p className="text-xl opacity-90">
              Rejoignez les praticiens qui économisent déjà des heures chaque semaine.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8" asChild>
                <Link href="/login">
                  <Play className="h-5 w-5" />
                  Commencer maintenant
                </Link>
              </Button>
            </div>
            <p className="text-sm opacity-75">
              Essai gratuit de 14 jours. Aucune carte bancaire requise.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <BrandMark size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">
                L&apos;assistant IA pour les professionnels de santé
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Intégrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Guide de démarrage
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    CGU
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    RGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2024 Selav. Tous droits réservés.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Hébergement HDS
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Support 7j/7
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
