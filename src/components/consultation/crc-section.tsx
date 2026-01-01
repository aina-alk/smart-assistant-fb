'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Edit2, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// Types
// ============================================================================

export interface CRCSectionProps {
  title: string;
  icon?: React.ReactNode;
  content: string | null;
  onChange: (content: string) => void;
  expanded?: boolean;
  onToggle?: () => void;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  /** Track if content was modified from original */
  originalContent?: string | null;
  /** Auto-save delay in ms (default: 1000) */
  autoSaveDelay?: number;
}

// ============================================================================
// CRC Section Component
// ============================================================================

export function CRCSection({
  title,
  icon,
  content,
  onChange,
  expanded = true,
  onToggle,
  readOnly = false,
  required = false,
  placeholder = 'Non renseigné',
  originalContent,
  autoSaveDelay = 1000,
}: CRCSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content || '');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if content was modified
  const isModified = originalContent !== undefined && content !== originalContent;
  const isEmpty = !content || content.trim().length === 0;
  const hasError = required && isEmpty;

  // Sync edit value when content changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(content || '');
    }
  }, [content, isEditing]);

  // Auto-save effect
  useEffect(() => {
    if (isEditing && editValue !== content) {
      // Clear previous timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (editValue.trim() !== (content || '').trim()) {
          onChange(editValue);
        }
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editValue, content, isEditing, onChange, autoSaveDelay]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    if (readOnly) return;
    setEditValue(content || '');
    setIsEditing(true);
  }, [content, readOnly]);

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
    setEditValue(content || '');
    setIsEditing(false);
  }, [content]);

  const handleReset = useCallback(() => {
    if (originalContent !== undefined) {
      onChange(originalContent || '');
      setEditValue(originalContent || '');
    }
  }, [originalContent, onChange]);

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

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        hasError && 'border-destructive/50 bg-destructive/5',
        isModified && !hasError && 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10'
      )}
    >
      {/* Header */}
      <div
        role={onToggle ? 'button' : undefined}
        tabIndex={onToggle ? 0 : undefined}
        onClick={onToggle}
        onKeyDown={
          onToggle
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle();
                }
              }
            : undefined
        }
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
          {icon && <span className="text-primary">{icon}</span>}
          <span className="font-medium">{title}</span>
          {required && <span className="text-xs text-destructive">*</span>}
          {isModified && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
              modifié
            </Badge>
          )}
          {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
        </div>

        {/* Actions (stop propagation to avoid toggling) */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isEditing && !readOnly && (
            <>
              {isModified && originalContent !== undefined && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  title="Réinitialiser"
                  className="h-7 w-7 p-0"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                title="Modifier"
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                title="Enregistrer (⌘+Enter)"
                className="h-7 w-7 p-0"
              >
                <Check className="h-3.5 w-3.5 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                title="Annuler (Échap)"
                className="h-7 w-7 p-0"
              >
                <X className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-3 pb-3">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[100px] resize-none"
              autoFocus
            />
          ) : (
            <div
              className={cn(
                'rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap min-h-[60px]',
                isEmpty && 'text-muted-foreground italic',
                !readOnly && 'cursor-pointer hover:bg-muted/50 transition-colors'
              )}
              onClick={handleStartEdit}
            >
              {content || placeholder}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
