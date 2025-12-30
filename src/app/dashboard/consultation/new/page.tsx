/**
 * New Consultation Page - Création d'une nouvelle consultation (placeholder)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, FileText, Stethoscope } from 'lucide-react';

export default function NewConsultationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nouvelle consultation</h2>
        <p className="text-muted-foreground">
          Démarrez une nouvelle consultation avec dictée vocale
        </p>
      </div>

      {/* Workflow steps */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="mt-4">1. Dictée vocale</CardTitle>
            <CardDescription>Dictez vos observations pendant l&apos;examen</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              <Mic className="mr-2 h-4 w-4" />
              Démarrer la dictée
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="mt-4">2. Génération CRC</CardTitle>
            <CardDescription>L&apos;IA génère automatiquement le compte-rendu</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Générer le CRC
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="mt-4">3. Codage automatique</CardTitle>
            <CardDescription>CIM-10, NGAP et CCAM proposés automatiquement</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              <Stethoscope className="mr-2 h-4 w-4" />
              Voir le codage
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Le workflow de consultation sera disponible après intégration avec AssemblyAI et Claude
            API.
            <br />
            Cette fonctionnalité sera implémentée dans les prochains blocs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
