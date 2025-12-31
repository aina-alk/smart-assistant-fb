'use client';

import { useState, useCallback } from 'react';
import { Search, User, X, Plus, Phone, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientSearch } from '@/lib/hooks/use-patient-search';
import { useConsultationStore } from '@/lib/stores/consultation-store';
import { getPatientFullName, getPatientAge } from '@/types/patient';
import type { Patient } from '@/types/patient';

interface PatientSelectorProps {
  className?: string;
  onCreateNew?: () => void;
}

export function PatientSelector({ className, onCreateNew }: PatientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const patient = useConsultationStore((s) => s.patient);
  const setPatient = useConsultationStore((s) => s.setPatient);
  const clearPatient = useConsultationStore((s) => s.clearPatient);

  const { data, isLoading, error } = usePatientSearch(searchQuery, { limit: 5 });

  const handleSelect = useCallback(
    (selectedPatient: Patient) => {
      setPatient(selectedPatient);
      setSearchQuery('');
      setIsSearching(false);
    },
    [setPatient]
  );

  const handleClear = useCallback(() => {
    clearPatient();
    setIsSearching(true);
  }, [clearPatient]);

  // Si un patient est sélectionné, afficher sa carte
  if (patient && !isSearching) {
    return (
      <Card className={cn('border-primary/20 bg-primary/5', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{getPatientFullName(patient)}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {getPatientAge(patient)} ans
                  </span>
                  <span>{patient.sexe === 'M' ? 'Homme' : 'Femme'}</span>
                  {patient.telephone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {patient.telephone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-1" />
              Changer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sinon, afficher le formulaire de recherche
  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un patient (nom, prénom, téléphone...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      {/* Résultats de recherche */}
      {searchQuery.length >= 2 && (
        <Card>
          <CardContent className="p-2">
            {isLoading && (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="p-4 text-sm text-destructive text-center">
                Erreur lors de la recherche
              </p>
            )}

            {data && data.patients.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">Aucun patient trouvé</p>
                {onCreateNew && (
                  <Button variant="outline" size="sm" onClick={onCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un nouveau patient
                  </Button>
                )}
              </div>
            )}

            {data && data.patients.length > 0 && (
              <ul className="divide-y">
                {data.patients.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleSelect(p)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors text-left"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{getPatientFullName(p)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getPatientAge(p)} ans • {p.sexe === 'M' ? 'H' : 'F'}
                          {p.telephone && ` • ${p.telephone}`}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message initial */}
      {searchQuery.length < 2 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Tapez au moins 2 caractères pour rechercher un patient</p>
          {onCreateNew && (
            <Button variant="link" size="sm" onClick={onCreateNew} className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Ou créer un nouveau patient
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Version compacte pour affichage dans le header
 */
export function PatientBadge({ className }: { className?: string }) {
  const patient = useConsultationStore((s) => s.patient);

  if (!patient) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <User className="h-4 w-4" />
        <span className="text-sm">Aucun patient</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
        <User className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-sm font-medium">{getPatientFullName(patient)}</span>
      <span className="text-xs text-muted-foreground">{getPatientAge(patient)} ans</span>
    </div>
  );
}
