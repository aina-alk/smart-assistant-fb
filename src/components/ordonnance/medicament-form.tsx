'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pill, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { medicamentCreateSchema } from '@/types/ordonnance';
import type { MedicamentCreate } from '@/types/ordonnance';

// ============================================================================
// Types
// ============================================================================

interface MedicamentFormProps {
  defaultValues?: Partial<MedicamentCreate>;
  onSubmit: (data: MedicamentCreate) => void;
  onCancel?: () => void;
  submitLabel?: string;
  compact?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const FORMES_GALENIQUES = [
  'comprimé',
  'gélule',
  'sachet',
  'sirop',
  'suspension buvable',
  'spray nasal',
  'gouttes auriculaires',
  'gouttes nasales',
  'collyre',
  'pommade',
  'crème',
  'gel',
  'suppositoire',
  'injectable',
] as const;

const DUREES_COURANTES = [
  '3 jours',
  '5 jours',
  '7 jours',
  '10 jours',
  '14 jours',
  '21 jours',
  '1 mois',
  '2 mois',
  '3 mois',
  '6 mois',
] as const;

// ============================================================================
// Component
// ============================================================================

export function MedicamentForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Ajouter',
  compact = false,
}: MedicamentFormProps) {
  const form = useForm<MedicamentCreate>({
    resolver: zodResolver(medicamentCreateSchema),
    defaultValues: {
      nom: '',
      forme: '',
      posologie: '',
      duree: '',
      quantite: undefined,
      instructions: '',
      ...defaultValues,
    },
  });

  const handleSubmit = (data: MedicamentCreate) => {
    onSubmit(data);
    form.reset();
  };

  if (compact) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nom du médicament" {...field} className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="forme"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Forme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORMES_GALENIQUES.map((forme) => (
                        <SelectItem key={forme} value={forme}>
                          {forme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="posologie"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormControl>
                    <Input
                      placeholder="Posologie (ex: 1 cp matin et soir)"
                      {...field}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duree"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Durée" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DUREES_COURANTES.map((duree) => (
                        <SelectItem key={duree} value={duree}>
                          {duree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Nouveau médicament</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du médicament *</FormLabel>
                <FormControl>
                  <Input placeholder="AUGMENTIN 1g" {...field} className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="forme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forme galénique *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la forme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FORMES_GALENIQUES.map((forme) => (
                      <SelectItem key={forme} value={forme}>
                        {forme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="posologie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posologie *</FormLabel>
              <FormControl>
                <Input placeholder="1 comprimé matin et soir pendant les repas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="duree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée du traitement *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la durée" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DUREES_COURANTES.map((duree) => (
                      <SelectItem key={duree} value={duree}>
                        {duree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité à délivrer</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="14"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions complémentaires</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="À prendre pendant les repas, éviter l'alcool..."
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
