'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import { PatientSearchField } from './patient-search-field';
import { tacheFormSchema, type TacheFormData } from '@/lib/validations/tache';
import type { Tache } from '@/types/tache';

interface TacheFormProps {
  defaultValues?: Partial<Tache>;
  defaultPatientId?: string;
  patientLocked?: boolean;
  onSubmit: (data: TacheFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function TacheForm({
  defaultValues,
  defaultPatientId,
  patientLocked = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Créer la tâche',
}: TacheFormProps) {
  const form = useForm<TacheFormData>({
    resolver: zodResolver(tacheFormSchema),
    defaultValues: {
      titre: defaultValues?.titre || '',
      description: defaultValues?.description || '',
      priorite: defaultValues?.priorite || 'normale',
      statut: defaultValues?.statut || 'a_faire',
      categorie: defaultValues?.categorie || 'autre',
      echeance: defaultValues?.echeance,
      rappel: defaultValues?.rappel,
      patientId: defaultPatientId || defaultValues?.patientId,
      consultationId: defaultValues?.consultationId,
    },
  });

  const handleSubmit = (data: TacheFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Patient *</FormLabel>
              <FormControl>
                <PatientSearchField
                  value={field.value}
                  onChange={(patientId) => field.onChange(patientId)}
                  disabled={patientLocked}
                  error={fieldState.error?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Rappeler M. DUPONT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détails de la tâche..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priorite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categorie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="rappel">Rappel</SelectItem>
                    <SelectItem value="suivi">Suivi</SelectItem>
                    <SelectItem value="administratif">Administratif</SelectItem>
                    <SelectItem value="medical">Médical</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="echeance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Échéance</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rappel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rappel</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
