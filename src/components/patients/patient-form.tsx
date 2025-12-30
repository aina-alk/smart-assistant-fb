'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { patientFormSchema, type PatientFormData } from '@/lib/validations/patient';

interface PatientFormProps {
  defaultValues?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function PatientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Créer le patient',
}: PatientFormProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      dateNaissance: undefined,
      sexe: undefined,
      telephone: '',
      email: '',
      adresse: '',
      codePostal: '',
      ville: '',
      nir: '',
      mutuelleNom: '',
      mutuelleNumero: '',
      ...defaultValues,
    },
  });

  const handleSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Informations personnelles */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations personnelles</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input placeholder="DUPONT" {...field} className="uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prenom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean" {...field} className="capitalize" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dateNaissance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
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
              name="sexe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexe *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Homme</SelectItem>
                      <SelectItem value="F">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="06 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jean.dupont@email.fr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Adresse</h3>
          <FormField
            control={form.control}
            name="adresse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="123 rue de la Paix" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="codePostal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code postal</FormLabel>
                  <FormControl>
                    <Input placeholder="75001" maxLength={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ville"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input placeholder="Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sécurité sociale */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sécurité sociale</h3>
          <FormField
            control={form.control}
            name="nir"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de sécurité sociale</FormLabel>
                <FormControl>
                  <Input placeholder="1 66 03 75 001 123 45" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="mutuelleNom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la mutuelle</FormLabel>
                  <FormControl>
                    <Input placeholder="MGEN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mutuelleNumero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro adhérent</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
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
