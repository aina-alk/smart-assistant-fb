'use client';

import { FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// Types
// ============================================================================

interface ConsultationDocumentsProps {
  consultationId: string;
  /** Document IDs (references to DocumentReference FHIR resources) */
  documents?: string[];
  className?: string;
  readOnly?: boolean;
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyDocuments({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">Aucun document attaché</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Les documents seront disponibles dans une prochaine version
      </p>
      {onAdd && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAdd} disabled>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un document
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Document ID Row (placeholder for bloc 5)
// ============================================================================

function DocumentIdRow({ documentId }: { documentId: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm truncate">{documentId}</p>
          <p className="text-xs text-muted-foreground">Document référencé</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ConsultationDocuments({
  consultationId,
  documents,
  className,
  readOnly = false,
}: ConsultationDocumentsProps) {
  // Placeholder - documents functionality will be implemented in bloc 5
  void consultationId;

  const hasDocuments = documents && documents.length > 0;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Documents
            {hasDocuments && (
              <Badge variant="secondary" className="ml-2">
                {documents.length}
              </Badge>
            )}
          </CardTitle>
          {!readOnly && hasDocuments && (
            <Button variant="outline" size="sm" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasDocuments ? (
          <div className="space-y-2">
            {documents.map((docId) => (
              <DocumentIdRow key={docId} documentId={docId} />
            ))}
          </div>
        ) : (
          <EmptyDocuments onAdd={readOnly ? undefined : () => {}} />
        )}
      </CardContent>
    </Card>
  );
}
