'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsultation } from '@/lib/hooks/use-consultation';
import { usePatient } from '@/lib/hooks/use-patient';
import { ConsultationHeader } from '@/components/consultation/consultation-header';
import { ConsultationView } from '@/components/consultation/consultation-view';

// ============================================================================
// Types
// ============================================================================

interface ConsultationDetailPageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function ConsultationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* CRC skeleton */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>

      {/* Documents skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Error State
// ============================================================================

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Erreur</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">{message}</p>
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function ConsultationDetailPage({ params }: ConsultationDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch consultation
  const {
    data: consultation,
    isLoading: isLoadingConsultation,
    error: consultationError,
  } = useConsultation(id);

  // Fetch patient if consultation has patientId
  const { data: patient, isLoading: isLoadingPatient } = usePatient(consultation?.patientId ?? '');

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/medecin/consultation/${id}/edit`);
  };

  // Loading state
  if (isLoadingConsultation) {
    return <ConsultationSkeleton />;
  }

  // Error: consultation not found
  if (consultationError?.message === 'Consultation non trouvée') {
    notFound();
  }

  // Error: other errors
  if (consultationError) {
    return (
      <ErrorState
        message={
          consultationError.message ||
          'Une erreur est survenue lors du chargement de la consultation.'
        }
        onBack={handleBack}
      />
    );
  }

  // No consultation data
  if (!consultation) {
    return <ConsultationSkeleton />;
  }

  // Show loading indicator while fetching patient (but don't block the view)
  const isLoadingPatientData = consultation.patientId && isLoadingPatient;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ConsultationHeader
        consultation={consultation}
        onEdit={handleEdit}
        backHref="/medecin/consultations"
      />

      {/* Patient loading indicator */}
      {isLoadingPatientData && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des données patient...
        </div>
      )}

      {/* Consultation View */}
      <ConsultationView consultation={consultation} patient={patient} />
    </div>
  );
}
