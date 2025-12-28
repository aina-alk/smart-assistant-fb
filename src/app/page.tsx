'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function HomePage() {
  const handleToast = () => {
    toast.success('Configuration réussie !', {
      description: 'Tailwind CSS et shadcn/ui sont prêts à être utilisés.',
    });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">
                Super Assistant Médical
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Application web pour chirurgiens ORL - génération de CRC via dictée vocale et IA
              </CardDescription>
            </div>
            <Badge variant="secondary" className="h-fit">
              Beta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@exemple.fr"
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleToast} className="flex-1">
              Commencer
            </Button>
            <Button variant="secondary" className="flex-1">
              En savoir plus
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Couleurs personnalisées :</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-2">
                <div className="h-12 rounded-md bg-primary" />
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded-md bg-secondary" />
                <p className="text-xs text-muted-foreground">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded-md bg-success" />
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 rounded-md bg-warning" />
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
