'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TranscriptionDisplayProps {
  /** Finalized transcript text (black) */
  finalText: string;
  /** Partial transcript being spoken (gray italic) */
  partialText: string;
  /** Enable edit mode functionality */
  editable?: boolean;
  /** Callback when text is edited */
  onEdit?: (text: string) => void;
  /** Word count to display */
  wordCount?: number;
  /** Duration in seconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TranscriptionDisplay({
  finalText,
  partialText,
  editable = true,
  onEdit,
  wordCount = 0,
  duration = 0,
  className,
}: TranscriptionDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(finalText);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  // Update edited text when finalText changes (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedText(finalText);
    }
  }, [finalText, isEditing]);

  // Auto-scroll to bottom when new text arrives
  useEffect(() => {
    if (autoScrollEnabled && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [finalText, partialText, autoScrollEnabled]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    // If user scrolled up (not at bottom), disable auto-scroll
    if (scrollTop < lastScrollTopRef.current && !isAtBottom) {
      setAutoScrollEnabled(false);
    }

    // If user scrolled to bottom, re-enable auto-scroll
    if (isAtBottom) {
      setAutoScrollEnabled(true);
    }

    lastScrollTopRef.current = scrollTop;
  }, []);

  const handleStartEdit = useCallback(() => {
    setEditedText(finalText);
    setIsEditing(true);
  }, [finalText]);

  const handleCancelEdit = useCallback(() => {
    setEditedText(finalText);
    setIsEditing(false);
  }, [finalText]);

  const handleSaveEdit = useCallback(() => {
    onEdit?.(editedText);
    setIsEditing(false);
  }, [editedText, onEdit]);

  const hasContent = finalText.length > 0 || partialText.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Transcription</CardTitle>
          {editable && hasContent && !isEditing && (
            <Button variant="ghost" size="sm" onClick={handleStartEdit} className="h-8 gap-2">
              <Pencil className="h-4 w-4" />
              Éditer
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-8 gap-1">
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveEdit} className="h-8 gap-1">
                <Check className="h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[200px] resize-none font-normal leading-relaxed"
            placeholder="Aucune transcription..."
            autoFocus
          />
        ) : (
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className={cn(
              'min-h-[200px] max-h-[400px] overflow-y-auto rounded-md border bg-muted/30 p-4',
              'scroll-smooth'
            )}
            role="log"
            aria-live="polite"
            aria-label="Transcription en temps réel"
          >
            {hasContent ? (
              <p className="whitespace-pre-wrap leading-relaxed">
                <span className="text-foreground">{finalText}</span>
                {partialText && (
                  <span className="text-muted-foreground italic">
                    {finalText ? ' ' : ''}
                    {partialText}
                  </span>
                )}
                {/* Blinking cursor when recording */}
                {partialText && (
                  <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5 align-middle" />
                )}
              </p>
            ) : (
              <p className="text-muted-foreground italic text-center py-8">
                Commencez à dicter pour voir la transcription apparaître ici...
              </p>
            )}
          </div>
        )}

        {/* Stats footer */}
        {hasContent && (
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>📝</span>
              <span>{wordCount} mots</span>
            </span>
            {duration > 0 && (
              <span className="flex items-center gap-1">
                <span>⏱</span>
                <span>{formatDuration(duration)} de dictée</span>
              </span>
            )}
            {!autoScrollEnabled && (
              <button
                onClick={() => setAutoScrollEnabled(true)}
                className="text-primary hover:underline text-xs ml-auto"
              >
                Reprendre le défilement auto
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
