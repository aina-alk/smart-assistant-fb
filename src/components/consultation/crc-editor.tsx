'use client';

import { useState, useCallback } from 'react';
import {
  FileText,
  Stethoscope,
  ClipboardList,
  Activity,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsultationStore } from '@/lib/stores/consultation-store';
import type { CRCGenerated, CRCExamen } from '@/types/generation';

// ============================================================================
// Types
// ============================================================================

interface CRCEditorProps {
  className?: string;
  isGenerating?: boolean;
  onRegenerate?: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  value: string | null;
  field: keyof CRCGenerated;
  placeholder?: string;
}

interface ExamenSectionProps {
  examen: CRCExamen;
  onUpdate: (field: keyof CRCExamen, value: string) => void;
}

// ============================================================================
// Section Labels
// ============================================================================

const EXAMEN_LABELS: Record<keyof CRCExamen, string> = {
  otoscopie_droite: 'Otoscopie droite',
  otoscopie_gauche: 'Otoscopie gauche',
  rhinoscopie: 'Rhinoscopie',
  oropharynx: 'Oropharynx',
  palpation_cervicale: 'Palpation cervicale',
  autres: 'Autres examens',
};

// ============================================================================
// Editable Section Component
// ============================================================================

function EditableSection({ title, icon, value, field, placeholder }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const updateCRCField = useConsultationStore((s) => s.updateCRCField);

  const handleSave = useCallback(() => {
    updateCRCField(field, editValue);
    setIsEditing(false);
  }, [field, editValue, updateCRCField]);

  const handleCancel = useCallback(() => {
    setEditValue(value || '');
    setIsEditing(false);
  }, [value]);

  const handleEdit = useCallback(() => {
    setEditValue(value || '');
    setIsEditing(true);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="font-medium">{title}</Label>
        </div>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px]"
          autoFocus
        />
      ) : (
        <div
          className={cn(
            'rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap',
            !value && 'text-muted-foreground italic'
          )}
        >
          {value || placeholder || 'Non renseigné'}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Examen Clinique Section (Collapsible)
// ============================================================================

function ExamenSection({ examen, onUpdate }: ExamenSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingField, setEditingField] = useState<keyof CRCExamen | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = useCallback(
    (field: keyof CRCExamen) => {
      setEditValue(examen[field] || '');
      setEditingField(field);
    },
    [examen]
  );

  const handleSave = useCallback(() => {
    if (editingField) {
      onUpdate(editingField, editValue);
      setEditingField(null);
    }
  }, [editingField, editValue, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  // Count filled fields
  const filledCount = Object.values(examen).filter((v) => v && v.trim().length > 0).length;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          <span className="font-medium">Examen Clinique ORL</span>
          <span className="text-xs text-muted-foreground">
            ({filledCount}/{Object.keys(examen).length} renseignés)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="grid gap-3 pl-6">
          {(Object.entries(EXAMEN_LABELS) as [keyof CRCExamen, string][]).map(([field, label]) => (
            <div key={field} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">{label}</Label>
                {editingField !== field ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleStartEdit(field)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleSave}>
                      <Check className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={handleCancel}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
              {editingField === field ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[60px] text-sm"
                  autoFocus
                />
              ) : (
                <div
                  className={cn(
                    'rounded border bg-muted/20 p-2 text-sm',
                    !examen[field] && 'text-muted-foreground italic'
                  )}
                >
                  {examen[field] || 'Non examiné'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function CRCEditorSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <CardTitle className="text-lg">Génération du CRC en cours...</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main CRC Editor Component
// ============================================================================

export function CRCEditor({ className, isGenerating, onRegenerate }: CRCEditorProps) {
  const crc = useConsultationStore((s) => s.crc);
  const updateCRCField = useConsultationStore((s) => s.updateCRCField);

  const handleExamenUpdate = useCallback(
    (field: keyof CRCExamen, value: string) => {
      if (!crc) return;
      updateCRCField('examen', {
        ...crc.examen,
        [field]: value,
      } as unknown as string);
    },
    [crc, updateCRCField]
  );

  if (isGenerating) {
    return <CRCEditorSkeleton />;
  }

  if (!crc) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Aucun compte-rendu généré</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Terminez la dictée pour générer le CRC automatiquement
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Compte-Rendu de Consultation
          </CardTitle>
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              Régénérer
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Motif */}
        <EditableSection
          title="Motif de consultation"
          icon={<ClipboardList className="h-4 w-4 text-primary" />}
          value={crc.motif}
          field="motif"
          placeholder="Motif de la consultation..."
        />

        {/* Histoire de la maladie */}
        <EditableSection
          title="Histoire de la maladie"
          icon={<FileText className="h-4 w-4 text-primary" />}
          value={crc.histoire}
          field="histoire"
          placeholder="Histoire de la maladie actuelle..."
        />

        {/* Examen clinique (collapsible) */}
        <ExamenSection examen={crc.examen} onUpdate={handleExamenUpdate} />

        {/* Examens complémentaires */}
        <EditableSection
          title="Examens complémentaires"
          icon={<Activity className="h-4 w-4 text-primary" />}
          value={crc.examens_complementaires}
          field="examens_complementaires"
          placeholder="Résultats d'examens complémentaires..."
        />

        {/* Diagnostic */}
        <EditableSection
          title="Diagnostic"
          icon={<Stethoscope className="h-4 w-4 text-primary" />}
          value={crc.diagnostic}
          field="diagnostic"
          placeholder="Diagnostic principal et secondaires..."
        />

        {/* Conduite à tenir */}
        <EditableSection
          title="Conduite à tenir"
          icon={<ClipboardList className="h-4 w-4 text-primary" />}
          value={crc.conduite}
          field="conduite"
          placeholder="Plan de traitement et suivi..."
        />

        {/* Conclusion */}
        <EditableSection
          title="Conclusion"
          icon={<FileText className="h-4 w-4 text-primary" />}
          value={crc.conclusion}
          field="conclusion"
          placeholder="Synthèse et conclusion..."
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Compact CRC Preview (for validation step)
// ============================================================================

export function CRCPreview({ className }: { className?: string }) {
  const crc = useConsultationStore((s) => s.crc);

  if (!crc) {
    return null;
  }

  return (
    <div className={cn('space-y-4 text-sm', className)}>
      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Motif</h4>
        <p>{crc.motif}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Diagnostic</h4>
        <p>{crc.diagnostic}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Conduite à tenir</h4>
        <p>{crc.conduite}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-1">Conclusion</h4>
        <p>{crc.conclusion}</p>
      </div>
    </div>
  );
}
