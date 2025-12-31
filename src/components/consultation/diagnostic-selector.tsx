'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Sparkles, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type {
  CIM10Code,
  DiagnosticSelection,
  DiagnosticSuggestion,
  CIM10Category,
} from '@/types/codage';

// ============================================================================
// Types
// ============================================================================

interface DiagnosticSelectorProps {
  onSelectionChange?: (selection: DiagnosticSelection) => void;
  initialSelection?: DiagnosticSelection;
  diagnosticText?: string;
  className?: string;
}

type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// Hooks
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Component
// ============================================================================

export function DiagnosticSelector({
  onSelectionChange,
  initialSelection,
  diagnosticText,
  className,
}: DiagnosticSelectorProps) {
  // Selection state
  const [principal, setPrincipal] = useState<CIM10Code | null>(initialSelection?.principal ?? null);
  const [secondaires, setSecondaires] = useState<CIM10Code[]>(initialSelection?.secondaires ?? []);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CIM10Code[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // AI extraction state
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>('idle');
  const [suggestions, setSuggestions] = useState<DiagnosticSuggestion[]>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search CIM-10 codes
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchCodes = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/codage/cim10?q=${encodeURIComponent(debouncedSearch)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.codes);
        }
      } catch (error) {
        console.error('Erreur recherche CIM-10:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchCodes();
  }, [debouncedSearch]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.({ principal, secondaires });
  }, [principal, secondaires, onSelectionChange]);

  // AI extraction
  const handleExtract = useCallback(async () => {
    if (!diagnosticText || diagnosticText.length < 3) return;

    setExtractionStatus('loading');
    setExtractionError(null);

    try {
      const response = await fetch('/api/codage/cim10', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostic: diagnosticText }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'extraction");
      }

      const data = await response.json();
      const allSuggestions: DiagnosticSuggestion[] = [];

      if (data.suggestions.principal) {
        allSuggestions.push({ ...data.suggestions.principal, isPrincipal: true });
      }

      allSuggestions.push(...data.suggestions.secondaires);
      setSuggestions(allSuggestions);
      setExtractionStatus('success');
    } catch (error) {
      console.error('Erreur extraction CIM-10:', error);
      setExtractionError(error instanceof Error ? error.message : 'Erreur inconnue');
      setExtractionStatus('error');
    }
  }, [diagnosticText]);

  // Selection handlers
  const selectCode = useCallback(
    (code: CIM10Code, asPrincipal: boolean) => {
      if (asPrincipal) {
        // If already principal, do nothing
        if (principal?.code === code.code) return;

        // If was in secondaires, remove it
        if (secondaires.some((s) => s.code === code.code)) {
          setSecondaires((prev) => prev.filter((s) => s.code !== code.code));
        }

        // Move current principal to secondaires if exists
        if (principal) {
          setSecondaires((prev) => [...prev, principal]);
        }

        setPrincipal(code);
      } else {
        // Don't add if already principal or in secondaires
        if (principal?.code === code.code) return;
        if (secondaires.some((s) => s.code === code.code)) return;

        // Max 3 secondaires
        if (secondaires.length >= 3) return;

        setSecondaires((prev) => [...prev, code]);
      }

      setSearchOpen(false);
      setSearchQuery('');
    },
    [principal, secondaires]
  );

  const removePrincipal = useCallback(() => {
    setPrincipal(null);
  }, []);

  const removeSecondaire = useCallback((code: string) => {
    setSecondaires((prev) => prev.filter((s) => s.code !== code));
  }, []);

  const applySuggestion = useCallback(
    (suggestion: DiagnosticSuggestion) => {
      const code: CIM10Code = {
        code: suggestion.code,
        libelle: suggestion.libelle,
        libelle_court: suggestion.libelle,
        categorie: 'Général' as CIM10Category,
      };

      selectCode(code, suggestion.isPrincipal ?? false);
    },
    [selectCode]
  );

  // Category badge color
  const getCategoryColor = (categorie: CIM10Category): string => {
    const colors: Record<CIM10Category, string> = {
      Oreille: 'bg-blue-100 text-blue-800',
      Nez: 'bg-green-100 text-green-800',
      Gorge: 'bg-orange-100 text-orange-800',
      Cou: 'bg-purple-100 text-purple-800',
      Général: 'bg-gray-100 text-gray-800',
    };
    return colors[categorie];
  };

  // Confidence indicator
  const getConfidenceColor = (confiance: number): string => {
    if (confiance >= 0.8) return 'text-green-600';
    if (confiance >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Codage CIM-10</span>
          {diagnosticText && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtract}
              disabled={extractionStatus === 'loading'}
              className="gap-2"
            >
              {extractionStatus === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Suggérer
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Suggestions IA :</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.code}
                  onClick={() => applySuggestion(s)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm',
                    'border border-dashed hover:border-solid transition-colors',
                    s.isPrincipal
                      ? 'border-primary bg-primary/5 hover:bg-primary/10'
                      : 'border-muted-foreground/30 hover:bg-muted'
                  )}
                >
                  <span className="font-mono text-xs">{s.code}</span>
                  <span className="text-xs truncate max-w-[150px]">{s.libelle}</span>
                  <span className={cn('text-xs', getConfidenceColor(s.confiance))}>
                    {Math.round(s.confiance * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Extraction Error */}
        {extractionStatus === 'error' && extractionError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {extractionError}
          </div>
        )}

        {/* Search Input */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                placeholder="Rechercher un code CIM-10..."
                className="pl-9"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[400px]" align="start">
            <Command shouldFilter={false}>
              <CommandList>
                {isSearching && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Recherche...
                  </div>
                )}
                {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <CommandEmpty>Aucun code trouvé</CommandEmpty>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <CommandGroup>
                    {searchResults.map((code) => (
                      <CommandItem
                        key={code.code}
                        onSelect={() => selectCode(code, !principal)}
                        className="flex items-start gap-2 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">{code.code}</span>
                            <Badge
                              variant="secondary"
                              className={cn('text-xs', getCategoryColor(code.categorie))}
                            >
                              {code.categorie}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{code.libelle}</p>
                        </div>
                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            principal?.code === code.code ||
                              secondaires.some((s) => s.code === code.code)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Diagnostics */}
        <div className="space-y-3">
          {/* Principal */}
          <div>
            <p className="text-sm font-medium mb-1">Diagnostic principal</p>
            {principal ? (
              <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20">
                <span className="font-mono text-sm font-medium">{principal.code}</span>
                <span className="text-sm flex-1 truncate">{principal.libelle}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removePrincipal}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Aucun diagnostic principal sélectionné
              </p>
            )}
          </div>

          {/* Secondaires */}
          <div>
            <p className="text-sm font-medium mb-1">
              Diagnostics secondaires ({secondaires.length}/3)
            </p>
            {secondaires.length > 0 ? (
              <div className="space-y-1">
                {secondaires.map((code) => (
                  <div
                    key={code.code}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border"
                  >
                    <span className="font-mono text-sm">{code.code}</span>
                    <span className="text-sm flex-1 truncate">{code.libelle}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeSecondaire(code.code)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun diagnostic secondaire</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
