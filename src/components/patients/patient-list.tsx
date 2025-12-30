'use client';

import { MoreVertical, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientCard } from './patient-card';
import type { Patient } from '@/types';
import { getPatientFullName, getPatientAge } from '@/types';
import { formatFrenchPhone } from '@/lib/utils/validators';

interface PatientListProps {
  patients: Patient[];
  total: number;
  isLoading?: boolean;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  currentPage?: number;
}

export function PatientList({
  patients,
  total,
  isLoading = false,
  hasNextPage = false,
  hasPrevPage = false,
  onNextPage,
  onPrevPage,
  onView,
  onEdit,
  currentPage = 1,
}: PatientListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return <PatientListSkeleton />;
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">Aucun patient trouvé</p>
        <p className="text-sm text-muted-foreground">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * 20 + 1;
  const endIndex = Math.min(currentPage * 20, total);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Desktop: Table */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Nom</TableHead>
                <TableHead className="w-[20%]">Date de naissance</TableHead>
                <TableHead className="w-[20%]">Téléphone</TableHead>
                <TableHead className="w-[20%]">Dernière visite</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  onClick={() => onView?.(patient)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{getPatientFullName(patient)}</TableCell>
                  <TableCell>
                    {formatDate(patient.dateNaissance)} ({getPatientAge(patient)} ans)
                  </TableCell>
                  <TableCell>
                    {patient.telephone ? formatFrenchPhone(patient.telephone) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(patient)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(patient)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="grid gap-3 md:hidden">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} onView={onView} onEdit={onEdit} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage {startIndex}-{endIndex} sur {total} patients
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!hasPrevPage} onClick={onPrevPage}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage}/{totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={onNextPage}>
            Suivant
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PatientListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Nom</TableHead>
                <TableHead className="w-[20%]">Date de naissance</TableHead>
                <TableHead className="w-[20%]">Téléphone</TableHead>
                <TableHead className="w-[20%]">Dernière visite</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
