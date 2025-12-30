'use client';

import { Calendar, Phone, Mail, MapPin, CreditCard, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Patient } from '@/types';
import { formatNIR, formatFrenchPhone } from '@/lib/utils/validators';

interface PatientInfoProps {
  patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Date de naissance */}
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
              <p className="text-sm">{formatDate(patient.dateNaissance)}</p>
            </div>
          </div>

          {/* Téléphone */}
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p className="text-sm">
                {patient.telephone ? formatFrenchPhone(patient.telephone) : '-'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{patient.email || '-'}</p>
            </div>
          </div>

          {/* Adresse */}
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresse</p>
              <p className="text-sm">
                {patient.adresse || patient.ville || patient.codePostal ? (
                  <>
                    {patient.adresse && <span>{patient.adresse}</span>}
                    {(patient.codePostal || patient.ville) && (
                      <>
                        {patient.adresse && <br />}
                        {patient.codePostal} {patient.ville}
                      </>
                    )}
                  </>
                ) : (
                  '-'
                )}
              </p>
            </div>
          </div>

          {/* NIR */}
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">N° Sécurité Sociale</p>
              <p className="text-sm font-mono">{patient.nir ? formatNIR(patient.nir) : '-'}</p>
            </div>
          </div>

          {/* Mutuelle */}
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mutuelle</p>
              <p className="text-sm">
                {patient.mutuelleNom || patient.mutuelleNumero ? (
                  <>
                    {patient.mutuelleNom && <span>{patient.mutuelleNom}</span>}
                    {patient.mutuelleNumero && (
                      <>
                        {patient.mutuelleNom && ' - '}
                        <span className="font-mono">{patient.mutuelleNumero}</span>
                      </>
                    )}
                  </>
                ) : (
                  '-'
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
