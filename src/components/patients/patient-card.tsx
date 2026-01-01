'use client';

import { MoreVertical, Eye, Pencil, Phone, Stethoscope, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/types';
import { getPatientFullName, getPatientAge } from '@/types';
import { formatFrenchPhone } from '@/lib/utils/validators';

interface PatientCardProps {
  patient: Patient;
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onNewConsultation?: (patient: Patient) => void;
  onNewTask?: (patient: Patient) => void;
}

export function PatientCard({
  patient,
  onView,
  onEdit,
  onNewConsultation,
  onNewTask,
}: PatientCardProps) {
  const fullName = getPatientFullName(patient);
  const age = getPatientAge(patient);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card
      onClick={() => onView?.(patient)}
      className="cursor-pointer transition-colors hover:bg-muted/50"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{fullName}</p>
              <Badge variant="outline" className="text-xs">
                {patient.sexe === 'M' ? 'H' : 'F'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(patient.dateNaissance)} ({age} ans)
            </p>
            {patient.telephone && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {formatFrenchPhone(patient.telephone)}
              </div>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onNewConsultation?.(patient)}
            >
              <Stethoscope className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-orange-600 hover:text-orange-600 hover:bg-orange-100"
              onClick={() => onNewTask?.(patient)}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(patient)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir le dossier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(patient)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
