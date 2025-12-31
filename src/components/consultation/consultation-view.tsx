'use client';

import { User, Stethoscope, Receipt, FileText, Euro } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CRCPreviewDocument } from './crc-preview';
import { ConsultationDocuments } from './consultation-documents';
import type { Consultation } from '@/types/consultation';
import type { Patient } from '@/types/patient';
import { getPatientFullName, getPatientAge } from '@/types/patient';

// ============================================================================
// Types
// ============================================================================

interface ConsultationViewProps {
  consultation: Consultation;
  patient?: Patient | null;
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

// ============================================================================
// Patient Info Card
// ============================================================================

function PatientInfoCard({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-primary" />
          Patient
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-lg">{getPatientFullName(patient)}</p>
            <p className="text-sm text-muted-foreground">
              {getPatientAge(patient)} ans • {patient.sexe === 'M' ? 'Homme' : 'Femme'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Diagnostics Card
// ============================================================================

function DiagnosticsCard({ consultation }: { consultation: Consultation }) {
  const { diagnostics } = consultation;

  if (
    !diagnostics?.principal &&
    (!diagnostics?.secondaires || diagnostics.secondaires.length === 0)
  ) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-primary" />
            Diagnostics CIM-10
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">Aucun diagnostic enregistré</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Stethoscope className="h-4 w-4 text-primary" />
          Diagnostics CIM-10
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {diagnostics?.principal && (
          <div className="flex items-start gap-3">
            <Badge variant="default" className="shrink-0">
              Principal
            </Badge>
            <div className="min-w-0">
              <p className="font-mono text-sm font-medium">{diagnostics.principal.code}</p>
              <p className="text-sm text-muted-foreground truncate">
                {diagnostics.principal.libelle}
              </p>
            </div>
          </div>
        )}

        {diagnostics?.secondaires && diagnostics.secondaires.length > 0 && (
          <>
            {diagnostics.principal && <Separator />}
            <div className="space-y-2">
              {diagnostics.secondaires.map((diag) => (
                <div key={diag.code} className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">
                    Secondaire
                  </Badge>
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{diag.code}</p>
                    <p className="text-sm text-muted-foreground truncate">{diag.libelle}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Codage Card
// ============================================================================

function CodageCard({ consultation }: { consultation: Consultation }) {
  const { codage } = consultation;

  if (!codage?.actes || codage.actes.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" />
            Facturation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">Aucun acte enregistré</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4 text-primary" />
          Facturation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Actes list */}
        <div className="space-y-2">
          {codage.actes.map((acte) => (
            <div key={acte.code} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={acte.type === 'NGAP' ? 'secondary' : 'outline'} className="text-xs">
                  {acte.type}
                </Badge>
                <span className="font-mono text-sm font-medium">{acte.code}</span>
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {acte.libelle}
                </span>
              </div>
              <span className="text-sm font-medium">{formatPrice(acte.tarif_base)}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total base</span>
            <span>{formatPrice(codage.total_base)}</span>
          </div>
          {codage.depassement > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dépassement</span>
              <span>{formatPrice(codage.depassement)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium pt-1">
            <span className="flex items-center gap-1">
              <Euro className="h-4 w-4" />
              Total honoraires
            </span>
            <span className="text-lg">{formatPrice(codage.total_honoraires)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CRC Card
// ============================================================================

function CRCCard({
  consultation,
  patient,
}: {
  consultation: Consultation;
  patient?: Patient | null;
}) {
  if (!consultation.crc) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Compte-Rendu de Consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">Aucun compte-rendu généré</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <CRCPreviewDocument
          crc={consultation.crc}
          patient={patient}
          dateConsultation={consultation.date}
          className="p-6"
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Consultation View
// ============================================================================

export function ConsultationView({ consultation, patient, className }: ConsultationViewProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Top row: Patient + Diagnostics + Codage */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {patient && <PatientInfoCard patient={patient} />}
        <DiagnosticsCard consultation={consultation} />
        <CodageCard consultation={consultation} />
      </div>

      {/* CRC */}
      <CRCCard consultation={consultation} patient={patient} />

      {/* Documents */}
      <ConsultationDocuments consultationId={consultation.id} documents={consultation.documents} />
    </div>
  );
}
