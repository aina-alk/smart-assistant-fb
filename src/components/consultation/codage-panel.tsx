'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Sparkles, Check, Loader2, AlertCircle, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  ActeFacturable,
  ActeSuggestion,
  CodageConsultation,
  NGAPCode,
  CCAMCode,
} from '@/types/codage';

interface CodagePanelProps {
  onCodageChange?: (codage: CodageConsultation) => void;
  initialCodage?: CodageConsultation;
  crcText?: string;
  diagnostics?: string[];
  className?: string;
}

type SuggestionStatus = 'idle' | 'loading' | 'success' | 'error';

const AUTO_APPLY_CONFIDENCE_THRESHOLD = 0.7;

export function CodagePanel({
  onCodageChange,
  initialCodage,
  crcText,
  diagnostics,
  className,
}: CodagePanelProps) {
  const [actes, setActes] = useState<ActeFacturable[]>(initialCodage?.actes ?? []);
  const [depassement, setDepassement] = useState(initialCodage?.depassement ?? 0);

  const [suggestions, setSuggestions] = useState<ActeSuggestion[]>([]);
  const [suggestionStatus, setSuggestionStatus] = useState<SuggestionStatus>('idle');
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'ngap' | 'ccam'>('ngap');
  const [ngapResults, setNgapResults] = useState<NGAPCode[]>([]);
  const [ccamResults, setCcamResults] = useState<CCAMCode[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [autoAppliedCodes, setAutoAppliedCodes] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchQuery, 300);

  const totalBase = actes.reduce((sum, a) => sum + a.tarif_base, 0);
  const totalHonoraires = totalBase + depassement;

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setNgapResults([]);
      setCcamResults([]);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      try {
        const [ngapRes, ccamRes] = await Promise.all([
          fetch(`/api/codage/ngap?q=${encodeURIComponent(debouncedSearch)}&limit=10`),
          fetch(`/api/codage/ccam?q=${encodeURIComponent(debouncedSearch)}&limit=10`),
        ]);

        if (ngapRes.ok) {
          const data = await ngapRes.json();
          setNgapResults(data.codes);
        }
        if (ccamRes.ok) {
          const data = await ccamRes.json();
          setCcamResults(data.codes);
        }
      } catch (error) {
        console.error('Erreur recherche codes:', error);
      } finally {
        setIsSearching(false);
      }
    };

    search();
  }, [debouncedSearch]);

  useEffect(() => {
    onCodageChange?.({
      actes,
      total_base: totalBase,
      depassement,
      total_honoraires: totalHonoraires,
    });
  }, [actes, depassement, totalBase, totalHonoraires, onCodageChange]);

  const handleSuggest = useCallback(async () => {
    if (!crcText || crcText.length < 10) return;

    setSuggestionStatus('loading');
    setSuggestionError(null);

    try {
      const response = await fetch('/api/codage/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crc: crcText, diagnostics }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suggestion');
      }

      const data = await response.json();
      const allSuggestions: ActeSuggestion[] = data.suggestions.actes;
      setSuggestions(allSuggestions);

      // AUTO-APPLY: Ajouter automatiquement les suggestions confiance >= 70%
      const toAutoApply = allSuggestions.filter(
        (s) => s.confiance >= AUTO_APPLY_CONFIDENCE_THRESHOLD
      );

      const newAutoAppliedCodes = new Set<string>();
      const newActes: ActeFacturable[] = [];

      toAutoApply.forEach((suggestion) => {
        if (!actes.some((a) => a.code === suggestion.code)) {
          newActes.push({
            type: suggestion.type,
            code: suggestion.code,
            libelle: suggestion.libelle,
            tarif_base: suggestion.tarif_base,
            selected: true,
          });
          newAutoAppliedCodes.add(suggestion.code);
        }
      });

      if (newActes.length > 0) {
        setActes((prev) => [...prev, ...newActes]);
        setAutoAppliedCodes(newAutoAppliedCodes);
        toast.success(
          `${newActes.length} acte${newActes.length > 1 ? 's' : ''} ajouté${newActes.length > 1 ? 's' : ''} automatiquement`
        );
      }

      setSuggestionStatus('success');
    } catch (error) {
      console.error('Erreur suggestion codage:', error);
      setSuggestionError(error instanceof Error ? error.message : 'Erreur inconnue');
      setSuggestionStatus('error');
    }
  }, [crcText, diagnostics, actes]);

  const addActe = useCallback(
    (acte: ActeFacturable) => {
      if (actes.some((a) => a.code === acte.code)) return;
      setActes((prev) => [...prev, { ...acte, selected: true }]);
      setSearchOpen(false);
      setSearchQuery('');
    },
    [actes]
  );

  const removeActe = useCallback((code: string) => {
    setActes((prev) => prev.filter((a) => a.code !== code));
    setAutoAppliedCodes((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  }, []);

  const applySuggestion = useCallback(
    (suggestion: ActeSuggestion) => {
      const acte: ActeFacturable = {
        type: suggestion.type,
        code: suggestion.code,
        libelle: suggestion.libelle,
        tarif_base: suggestion.tarif_base,
        selected: true,
      };
      addActe(acte);
    },
    [addActe]
  );

  const addFromNGAP = useCallback(
    (code: NGAPCode) => {
      addActe({
        type: 'NGAP',
        code: code.code,
        libelle: code.libelle,
        tarif_base: code.tarif_base,
        selected: true,
      });
    },
    [addActe]
  );

  const addFromCCAM = useCallback(
    (code: CCAMCode) => {
      addActe({
        type: 'CCAM',
        code: code.code,
        libelle: code.libelle,
        tarif_base: code.tarif_base,
        selected: true,
      });
    },
    [addActe]
  );

  const getConfidenceColor = (confiance: number): string => {
    if (confiance >= 0.8) return 'text-green-600';
    if (confiance >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace('.', ',') + ' €';
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Codage Actes</span>
          {crcText && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSuggest}
              disabled={suggestionStatus === 'loading'}
              className="gap-2"
            >
              {suggestionStatus === 'loading' ? (
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
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Suggestions IA :</p>
            <div className="space-y-1">
              {suggestions.map((s) => (
                <button
                  key={s.code}
                  onClick={() => applySuggestion(s)}
                  disabled={actes.some((a) => a.code === s.code)}
                  className={cn(
                    'w-full flex items-center justify-between p-2 rounded-md text-sm',
                    'border border-dashed hover:border-solid transition-colors',
                    actes.some((a) => a.code === s.code)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-1 bg-muted rounded">
                      {s.type === 'NGAP' ? 'N' : 'C'}
                    </span>
                    <span className="font-medium">{s.code}</span>
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {s.libelle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs', getConfidenceColor(s.confiance))}>
                      {Math.round(s.confiance * 100)}%
                    </span>
                    <span className="font-medium">{formatPrice(s.tarif_base)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {suggestionStatus === 'error' && suggestionError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {suggestionError}
          </div>
        )}

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
                placeholder="Rechercher un acte NGAP ou CCAM..."
                className="pl-9"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[450px]" align="start">
            <Tabs value={searchTab} onValueChange={(v) => setSearchTab(v as 'ngap' | 'ccam')}>
              <TabsList className="w-full">
                <TabsTrigger value="ngap" className="flex-1">
                  NGAP ({ngapResults.length})
                </TabsTrigger>
                <TabsTrigger value="ccam" className="flex-1">
                  CCAM ({ccamResults.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ngap" className="m-0">
                <Command shouldFilter={false}>
                  <CommandList>
                    {isSearching && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Recherche...
                      </div>
                    )}
                    {!isSearching && ngapResults.length === 0 && searchQuery.length >= 2 && (
                      <CommandEmpty>Aucun code NGAP trouvé</CommandEmpty>
                    )}
                    {!isSearching && ngapResults.length > 0 && (
                      <CommandGroup>
                        {ngapResults.map((code) => (
                          <CommandItem
                            key={code.code}
                            onSelect={() => addFromNGAP(code)}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{code.code}</span>
                              <span className="text-sm text-muted-foreground">{code.libelle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatPrice(code.tarif_base)}</span>
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  actes.some((a) => a.code === code.code)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </TabsContent>
              <TabsContent value="ccam" className="m-0">
                <Command shouldFilter={false}>
                  <CommandList>
                    {isSearching && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Recherche...
                      </div>
                    )}
                    {!isSearching && ccamResults.length === 0 && searchQuery.length >= 2 && (
                      <CommandEmpty>Aucun code CCAM trouvé</CommandEmpty>
                    )}
                    {!isSearching && ccamResults.length > 0 && (
                      <CommandGroup>
                        {ccamResults.map((code) => (
                          <CommandItem
                            key={code.code}
                            onSelect={() => addFromCCAM(code)}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{code.code}</span>
                              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {code.libelle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatPrice(code.tarif_base)}</span>
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  actes.some((a) => a.code === code.code)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <div className="space-y-2">
          <p className="text-sm font-medium">Actes sélectionnés</p>
          {actes.length > 0 ? (
            <div className="space-y-1">
              {actes.map((acte) => (
                <div
                  key={acte.code}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 border"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={true} onCheckedChange={() => removeActe(acte.code)} />
                    <span className="font-mono text-xs px-1 bg-background rounded">
                      {acte.type === 'NGAP' ? 'N' : 'C'}
                    </span>
                    <span className="font-medium">{acte.code}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {acte.libelle}
                    </span>
                    {autoAppliedCodes.has(acte.code) && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{formatPrice(acte.tarif_base)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Aucun acte sélectionné</p>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label htmlFor="depassement" className="text-sm font-medium">
              Dépassement honoraires (Secteur 2)
            </label>
            <div className="relative flex-1 max-w-[150px]">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="depassement"
                type="number"
                min="0"
                step="0.01"
                value={depassement}
                onChange={(e) => setDepassement(parseFloat(e.target.value) || 0)}
                className="pl-9 text-right"
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total base</span>
              <span>{formatPrice(totalBase)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dépassement</span>
              <span>{formatPrice(depassement)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total honoraires</span>
              <span className="text-lg">{formatPrice(totalHonoraires)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
