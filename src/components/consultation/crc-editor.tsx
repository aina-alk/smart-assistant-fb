'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  FileText,
  ClipboardList,
  Activity,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsultationStore } from '@/lib/stores/consultation-store';
import { CRCSection } from './crc-section';
import { CRCExamenSection } from './crc-examen-section';
import { CRCPreviewDialog, CRCPreviewCompact } from './crc-preview';
import type { CRCGenerated, CRCExamen } from '@/types/generation';

// ============================================================================
// Types
// ============================================================================

interface CRCEditorProps {
  className?: string;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  readOnly?: boolean;
}

interface SectionConfig {
  field: keyof Omit<CRCGenerated, 'examen'>;
  title: string;
  icon: React.ReactNode;
  required: boolean;
  placeholder: string;
}

// ============================================================================
// Section Configuration
// ============================================================================

const SECTIONS: SectionConfig[] = [
  {
    field: 'motif',
    title: 'Motif de consultation',
    icon: <ClipboardList className="h-4 w-4" />,
    required: false,
    placeholder: 'Motif de la consultation...',
  },
  {
    field: 'histoire',
    title: 'Histoire de la maladie',
    icon: <FileText className="h-4 w-4" />,
    required: false,
    placeholder: 'Histoire de la maladie actuelle...',
  },
  {
    field: 'examens_complementaires',
    title: 'Examens complémentaires',
    icon: <Activity className="h-4 w-4" />,
    required: false,
    placeholder: "Résultats d'examens complémentaires...",
  },
  {
    field: 'diagnostic',
    title: 'Diagnostic',
    icon: <FileText className="h-4 w-4" />,
    required: false,
    placeholder: 'Diagnostic principal et secondaires...',
  },
  {
    field: 'conduite',
    title: 'Conduite à tenir',
    icon: <ClipboardList className="h-4 w-4" />,
    required: false,
    placeholder: 'Plan de traitement et suivi...',
  },
  {
    field: 'conclusion',
    title: 'Conclusion',
    icon: <FileText className="h-4 w-4" />,
    required: true,
    placeholder: 'Synthèse et conclusion...',
  },
];

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

export function CRCEditor({
  className,
  isGenerating,
  onRegenerate,
  readOnly = false,
}: CRCEditorProps) {
  const crc = useConsultationStore((s) => s.crc);
  const patient = useConsultationStore((s) => s.patient);
  const updateCRCField = useConsultationStore((s) => s.updateCRCField);

  // Track original CRC for modification detection
  const originalCRCRef = useRef<CRCGenerated | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Expanded state for sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    motif: true,
    histoire: true,
    examen: true,
    examens_complementaires: false,
    diagnostic: true,
    conduite: true,
    conclusion: true,
  });

  // Store original CRC on first load
  useEffect(() => {
    if (crc && !originalCRCRef.current) {
      originalCRCRef.current = JSON.parse(JSON.stringify(crc));
    }
  }, [crc]);

  // Reset original when regenerating
  useEffect(() => {
    if (isGenerating) {
      originalCRCRef.current = null;
    }
  }, [isGenerating]);

  // Check if any section is modified
  const isModified = useCallback(() => {
    if (!crc || !originalCRCRef.current) return false;
    return JSON.stringify(crc) !== JSON.stringify(originalCRCRef.current);
  }, [crc]);

  // Check validation errors (only conclusion is required)
  const getValidationErrors = useCallback(() => {
    if (!crc) return [];
    const errors: string[] = [];
    SECTIONS.forEach((section) => {
      if (section.required) {
        const value = crc[section.field];
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          errors.push(section.title);
        }
      }
    });
    return errors;
  }, [crc]);

  const handleFieldChange = useCallback(
    (field: keyof CRCGenerated, value: string) => {
      updateCRCField(field, value);
      setLastModified(new Date());
    },
    [updateCRCField]
  );

  const handleExamenChange = useCallback(
    (examen: CRCExamen) => {
      updateCRCField('examen', examen as unknown as string);
      setLastModified(new Date());
    },
    [updateCRCField]
  );

  const toggleSection = useCallback((field: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

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

  const validationErrors = getValidationErrors();
  const hasErrors = validationErrors.length > 0;

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Compte-Rendu de Consultation
              </CardTitle>
              {isModified() && (
                <Badge variant="outline" className="text-amber-600 border-amber-400">
                  modifié
                </Badge>
              )}
              {hasErrors && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.length} section(s) requise(s)
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {lastModified && (
                <span className="text-xs text-muted-foreground">
                  Dernière modification:{' '}
                  {lastModified.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
              {onRegenerate && !readOnly && (
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Régénérer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Motif & Histoire */}
          {SECTIONS.slice(0, 2).map((section) => (
            <CRCSection
              key={section.field}
              title={section.title}
              icon={section.icon}
              content={crc[section.field]}
              onChange={(value) => handleFieldChange(section.field, value)}
              expanded={expandedSections[section.field]}
              onToggle={() => toggleSection(section.field)}
              readOnly={readOnly}
              required={section.required}
              placeholder={section.placeholder}
              originalContent={originalCRCRef.current?.[section.field]}
            />
          ))}

          {/* Examen Clinique (special section) */}
          <CRCExamenSection
            examen={crc.examen}
            onChange={handleExamenChange}
            readOnly={readOnly}
            expanded={expandedSections.examen}
            onToggle={() => toggleSection('examen')}
            originalExamen={originalCRCRef.current?.examen}
          />

          {/* Remaining sections */}
          {SECTIONS.slice(2).map((section) => (
            <CRCSection
              key={section.field}
              title={section.title}
              icon={section.icon}
              content={crc[section.field]}
              onChange={(value) => handleFieldChange(section.field, value)}
              expanded={expandedSections[section.field]}
              onToggle={() => toggleSection(section.field)}
              readOnly={readOnly}
              required={section.required}
              placeholder={section.placeholder}
              originalContent={originalCRCRef.current?.[section.field]}
            />
          ))}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <CRCPreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        crc={crc}
        patient={patient}
        dateConsultation={new Date()}
      />
    </>
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

  return <CRCPreviewCompact crc={crc} className={className} />;
}
