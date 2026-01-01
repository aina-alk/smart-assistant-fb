'use client';

import { useState, useEffect } from 'react';
import { Search, User, X, Loader2, Calendar, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientSearch } from '@/lib/hooks/use-patient-search';
import { usePatient } from '@/lib/hooks/use-patient';
import { getPatientFullName, getPatientAge } from '@/types/patient';
import type { Patient } from '@/types/patient';

interface PatientSearchFieldProps {
  value?: string;
  onChange: (patientId: string | undefined, patient: Patient | undefined) => void;
  disabled?: boolean;
  error?: string;
}

export function PatientSearchField({
  value,
  onChange,
  disabled = false,
  error,
}: PatientSearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(!value);

  const { data: patientData, isLoading: isLoadingPatient } = usePatient(value || '');
  const { data: searchData, isLoading: isSearchLoading } = usePatientSearch(searchQuery, {
    limit: 5,
  });

  useEffect(() => {
    if (value && patientData) {
      setIsSearching(false);
    }
  }, [value, patientData]);

  const handleSelect = (patient: Patient) => {
    onChange(patient.id, patient);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleClear = () => {
    if (disabled) return;
    onChange(undefined, undefined);
    setIsSearching(true);
  };

  if (value && !isSearching) {
    if (isLoadingPatient) {
      return (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      );
    }

    if (patientData) {
      return (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3',
            disabled ? 'bg-muted/50' : 'border-primary/20 bg-primary/5'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{getPatientFullName(patientData)}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getPatientAge(patientData)} ans
              </span>
              <span>{patientData.sexe === 'M' ? 'Homme' : 'Femme'}</span>
              {patientData.telephone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {patientData.telephone}
                </span>
              )}
            </div>
          </div>
          {!disabled && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un patient (nom, prénom, téléphone...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn('pl-10', error && 'border-destructive')}
          disabled={disabled}
        />
        {isSearchLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {searchQuery.length >= 2 && (
        <Card>
          <CardContent className="p-2">
            {isSearchLoading && (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchData && searchData.patients.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground text-center">Aucun patient trouvé</p>
            )}

            {searchData && searchData.patients.length > 0 && (
              <ul className="divide-y">
                {searchData.patients.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(p)}
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-muted/50 rounded-md transition-colors text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getPatientFullName(p)}</p>
                        <p className="text-xs text-muted-foreground">
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

      {searchQuery.length < 2 && searchQuery.length > 0 && (
        <p className="text-xs text-muted-foreground">Tapez au moins 2 caractères</p>
      )}
    </div>
  );
}
