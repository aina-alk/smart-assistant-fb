'use client';

/**
 * PDF Download Button - Composant de téléchargement PDF
 * Permet de générer et télécharger des PDFs pour CRC, Ordonnance, Bilan
 */

import { useState, useCallback } from 'react';
import { Download, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DocumentType } from '@/lib/pdf';

// ============================================================================
// Types
// ============================================================================

interface BasePDFDownloadButtonProps {
  /** Type de document à générer */
  documentType: DocumentType;
  /** Données à envoyer pour la génération */
  data: Record<string, unknown>;
  /** ID du document (optionnel, pour référence future) */
  documentId?: string;
  /** Callback après téléchargement réussi */
  onDownloadSuccess?: () => void;
  /** Callback en cas d'erreur */
  onDownloadError?: (error: Error) => void;
  /** Texte du bouton (optionnel) */
  label?: string;
  /** Afficher uniquement l'icône */
  iconOnly?: boolean;
}

export type PDFDownloadButtonProps = BasePDFDownloadButtonProps &
  Omit<ButtonProps, 'onClick' | 'onError'>;

// ============================================================================
// Labels par type
// ============================================================================

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  crc: 'Compte-Rendu',
  ordonnance: 'Ordonnance',
  bilan: 'Bilan',
};

// ============================================================================
// Component
// ============================================================================

export function PDFDownloadButton({
  documentType,
  data,
  documentId = 'new',
  onDownloadSuccess,
  onDownloadError,
  label,
  iconOnly = false,
  className,
  variant = 'outline',
  size = 'default',
  disabled,
  ...props
}: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultLabel = label || `Télécharger ${DOCUMENT_LABELS[documentType]}`;

  const handleDownload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/pdf?type=${documentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la génération du PDF');
      }

      // Récupérer le blob
      const blob = await response.blob();

      // Extraire le nom de fichier du header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${DOCUMENT_LABELS[documentType]}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
        }
      }

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onDownloadSuccess?.();
    } catch (err) {
      const downloadError = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(downloadError.message);
      onDownloadError?.(downloadError);
    } finally {
      setIsLoading(false);
    }
  }, [documentType, data, documentId, onDownloadSuccess, onDownloadError]);

  const buttonContent = (
    <>
      {isLoading ? (
        <Loader2 className={cn('h-4 w-4 animate-spin', !iconOnly && 'mr-2')} />
      ) : error ? (
        <AlertCircle className={cn('h-4 w-4 text-destructive', !iconOnly && 'mr-2')} />
      ) : (
        <Download className={cn('h-4 w-4', !iconOnly && 'mr-2')} />
      )}
      {!iconOnly && (isLoading ? 'Génération...' : defaultLabel)}
    </>
  );

  return (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : size}
      className={className}
      disabled={disabled || isLoading}
      onClick={handleDownload}
      title={iconOnly ? error || defaultLabel : undefined}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}

// ============================================================================
// Specialized Components
// ============================================================================

export interface CRCDownloadButtonProps extends Omit<
  PDFDownloadButtonProps,
  'documentType' | 'data'
> {
  crc: Record<string, unknown>;
  patient: Record<string, unknown>;
  praticien?: Record<string, unknown>;
  date?: string;
  diagnostics?: Record<string, unknown>;
  codage?: Record<string, unknown>;
}

export function CRCDownloadButton({
  crc,
  patient,
  praticien,
  date,
  diagnostics,
  codage,
  ...props
}: CRCDownloadButtonProps) {
  return (
    <PDFDownloadButton
      documentType="crc"
      data={{ crc, patient, praticien, date, diagnostics, codage }}
      label="Télécharger CRC"
      {...props}
    />
  );
}

export interface OrdonnanceDownloadButtonProps extends Omit<
  PDFDownloadButtonProps,
  'documentType' | 'data'
> {
  medicaments: Array<Record<string, unknown>>;
  patient: Record<string, unknown>;
  praticien?: Record<string, unknown>;
  date?: string;
  commentaire?: string;
}

export function OrdonnanceDownloadButton({
  medicaments,
  patient,
  praticien,
  date,
  commentaire,
  ...props
}: OrdonnanceDownloadButtonProps) {
  return (
    <PDFDownloadButton
      documentType="ordonnance"
      data={{ medicaments, patient, praticien, date, commentaire }}
      label="Télécharger Ordonnance"
      {...props}
    />
  );
}

export interface BilanDownloadButtonProps extends Omit<
  PDFDownloadButtonProps,
  'documentType' | 'data'
> {
  examens: Array<Record<string, unknown>>;
  patient: Record<string, unknown>;
  praticien?: Record<string, unknown>;
  date?: string;
  contexte_clinique?: string;
}

export function BilanDownloadButton({
  examens,
  patient,
  praticien,
  date,
  contexte_clinique,
  ...props
}: BilanDownloadButtonProps) {
  return (
    <PDFDownloadButton
      documentType="bilan"
      data={{ examens, patient, praticien, date, contexte_clinique }}
      label="Télécharger Bilan"
      {...props}
    />
  );
}

// ============================================================================
// Document Preview Icon (for list views)
// ============================================================================

export interface DocumentPreviewIconProps {
  type: DocumentType;
  className?: string;
}

export function DocumentPreviewIcon({ type, className }: DocumentPreviewIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center h-8 w-8 rounded bg-muted text-muted-foreground',
        className
      )}
      title={DOCUMENT_LABELS[type]}
    >
      <FileText className="h-4 w-4" />
    </div>
  );
}
