'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Edit2,
  Check,
  X,
  RotateCcw,
  Ear,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { CRCExamen } from '@/types/generation';

// ============================================================================
// Types
// ============================================================================

export interface CRCExamenSectionProps {
  examen: CRCExamen;
  onChange: (examen: CRCExamen) => void;
  readOnly?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  originalExamen?: CRCExamen;
  autoSaveDelay?: number;
}

interface SubSectionProps {
  label: string;
  icon?: React.ReactNode;
  value: string | null;
  onChange: (value: string) => void;
  readOnly?: boolean;
  isModified?: boolean;
  autoSaveDelay?: number;
}

// ============================================================================
// Sub-section Labels & Icons
// ============================================================================

const EXAMEN_CONFIG: Array<{
  field: keyof CRCExamen;
  label: string;
  icon: React.ReactNode;
}> = [
  { field: 'otoscopie', label: 'Otoscopie', icon: <Ear className="h-3.5 w-3.5" /> },
  { field: 'rhinoscopie', label: 'Rhinoscopie', icon: <Eye className="h-3.5 w-3.5" /> },
  { field: 'oropharynx', label: 'Oropharynx', icon: <Eye className="h-3.5 w-3.5" /> },
  { field: 'palpation_cervicale', label: 'Palpation cervicale', icon: null },
  { field: 'autres', label: 'Autres examens', icon: null },
];

// ============================================================================
// Sub-Section Component
// ============================================================================

function ExamenSubSection({
  label,
  icon,
  value,
  onChange,
  readOnly = false,
  isModified = false,
  autoSaveDelay = 1000,
}: SubSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value || '');
    }
  }, [value, isEditing]);

  // Auto-save effect
  useEffect(() => {
    if (isEditing && editValue !== value) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (editValue.trim() !== (value || '').trim()) {
          onChange(editValue);
        }
      }, autoSaveDelay);
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editValue, value, isEditing, onChange, autoSaveDelay]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    if (readOnly) return;
    setEditValue(value || '');
    setIsEditing(true);
  }, [value, readOnly]);

  const handleSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    onChange(editValue);
    setIsEditing(false);
  }, [editValue, onChange]);

  const handleCancel = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    setEditValue(value || '');
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter' && e.metaKey) {
        handleSave();
      }
    },
    [handleCancel, handleSave]
  );

  const isEmpty = !value || value.trim().length === 0;

  return (
    <div
      className={cn(
        'rounded-md border p-2 transition-colors',
        isModified && 'border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/10'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {icon}
          {label}
          {isModified && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 text-amber-600 border-amber-400"
            >
              modifié
            </Badge>
          )}
        </Label>
        {!isEditing && !readOnly && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleStartEdit}>
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
        {isEditing && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleSave}>
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCancel}>
              <X className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] text-sm resize-none"
          placeholder="Non examiné"
        />
      ) : (
        <div
          className={cn(
            'rounded border bg-muted/20 p-2 text-sm min-h-[40px]',
            isEmpty && 'text-muted-foreground italic',
            !readOnly && 'cursor-pointer hover:bg-muted/40 transition-colors'
          )}
          onClick={handleStartEdit}
        >
          {value || 'Non examiné'}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Examen Section Component
// ============================================================================

export function CRCExamenSection({
  examen,
  onChange,
  readOnly = false,
  expanded = true,
  onToggle,
  originalExamen,
  autoSaveDelay = 1000,
}: CRCExamenSectionProps) {
  // Count filled and modified fields
  const filledCount = Object.values(examen).filter((v) => v && v.trim().length > 0).length;
  const totalCount = Object.keys(examen).length;

  const isAnyModified = originalExamen
    ? Object.keys(examen).some(
        (key) => examen[key as keyof CRCExamen] !== originalExamen[key as keyof CRCExamen]
      )
    : false;

  const handleSubChange = useCallback(
    (field: keyof CRCExamen, value: string) => {
      onChange({
        ...examen,
        [field]: value || null,
      });
    },
    [examen, onChange]
  );

  const handleReset = useCallback(() => {
    if (originalExamen) {
      onChange(originalExamen);
    }
  }, [originalExamen, onChange]);

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        isAnyModified && 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        className={cn(
          'flex w-full items-center justify-between p-3 text-left',
          onToggle && 'hover:bg-muted/50 transition-colors cursor-pointer',
          !onToggle && 'cursor-default'
        )}
      >
        <div className="flex items-center gap-2">
          {onToggle && (
            <span className="text-muted-foreground">
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
          <Stethoscope className="h-4 w-4 text-primary" />
          <span className="font-medium">Examen Clinique ORL</span>
          <span className="text-xs text-muted-foreground">
            ({filledCount}/{totalCount} renseignés)
          </span>
          {isAnyModified && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
              modifié
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {isAnyModified && originalExamen && !readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              title="Réinitialiser tout l'examen"
              className="h-7 px-2"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Réinitialiser</span>
            </Button>
          )}
        </div>
      </button>

      {/* Sub-sections */}
      {expanded && (
        <div className="grid gap-2 px-3 pb-3 md:grid-cols-2">
          {EXAMEN_CONFIG.map(({ field, label, icon }) => (
            <ExamenSubSection
              key={field}
              label={label}
              icon={icon}
              value={examen[field]}
              onChange={(value) => handleSubChange(field, value)}
              readOnly={readOnly}
              isModified={originalExamen ? examen[field] !== originalExamen[field] : false}
              autoSaveDelay={autoSaveDelay}
            />
          ))}
        </div>
      )}
    </div>
  );
}
