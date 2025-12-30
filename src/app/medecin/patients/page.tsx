'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientSearch, PatientList } from '@/components/patients';
import { usePatients } from '@/lib/hooks/use-patients';
import { usePatientSearch } from '@/lib/hooks/use-patient-search';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageTokens, setPageTokens] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Utiliser la recherche si query >= 2 caractères, sinon liste normale
  const isSearching = searchQuery.length >= 2;

  const patientsQuery = usePatients({
    limit: 20,
    pageToken: pageTokens[currentPage - 2] || undefined,
  });

  const searchResult = usePatientSearch(searchQuery, { limit: 20 });

  // Choisir les données à afficher
  const activeQuery = isSearching ? searchResult : patientsQuery;
  const patients = activeQuery.data?.patients || [];
  const total = activeQuery.data?.total || 0;
  const nextPageToken = activeQuery.data?.nextPageToken;

  const handleNextPage = () => {
    if (nextPageToken) {
      setPageTokens((prev) => [...prev, nextPageToken]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPageTokens((prev) => prev.slice(0, -1));
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Reset pagination on new search
    setPageTokens([]);
    setCurrentPage(1);
  };

  const handleView = (patient: Patient) => {
    router.push(`/medecin/patients/${patient.id}`);
  };

  const handleEdit = (patient: Patient) => {
    router.push(`/medecin/patients/${patient.id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patients</h2>
          <p className="text-muted-foreground">Gérez votre liste de patients</p>
        </div>
        <Button onClick={() => router.push('/medecin/patients/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau patient
        </Button>
      </div>

      {/* Search */}
      <PatientSearch
        value={searchQuery}
        onChange={handleSearchChange}
        isLoading={activeQuery.isLoading || activeQuery.isFetching}
      />

      {/* Error state */}
      {activeQuery.isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {activeQuery.error instanceof Error
            ? activeQuery.error.message
            : 'Erreur lors du chargement des patients'}
        </div>
      )}

      {/* Patient list */}
      <PatientList
        patients={patients}
        total={total}
        isLoading={activeQuery.isLoading}
        hasNextPage={!!nextPageToken}
        hasPrevPage={currentPage > 1}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onView={handleView}
        onEdit={handleEdit}
        currentPage={currentPage}
      />
    </div>
  );
}
