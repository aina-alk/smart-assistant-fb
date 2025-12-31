'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useConsultationStore, STEP_ORDER, STEP_LABELS } from '@/lib/stores/consultation-store';

interface StepIndicatorProps {
  className?: string;
}

export function StepIndicator({ className }: StepIndicatorProps) {
  const currentStep = useConsultationStore((s) => s.currentStep);
  const completedSteps = useConsultationStore((s) => s.completedSteps);
  const goToStep = useConsultationStore((s) => s.goToStep);
  const isStepAccessible = useConsultationStore((s) => s.isStepAccessible);

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <nav aria-label="Étapes de la consultation" className={cn('w-full', className)}>
      <ol className="flex items-center justify-between">
        {STEP_ORDER.map((step, index) => {
          const isCompleted = completedSteps.has(step);
          const isCurrent = step === currentStep;
          const isAccessible = isStepAccessible(step);
          const isPast = index < currentIndex;

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <button
                onClick={() => goToStep(step)}
                disabled={!isAccessible}
                className={cn(
                  'group flex flex-col items-center gap-2 transition-all',
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                    isCurrent && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && !isCurrent && 'border-primary bg-primary/10 text-primary',
                    !isCurrent &&
                      !isCompleted &&
                      isPast &&
                      'border-muted-foreground/50 text-muted-foreground',
                    !isCurrent && !isCompleted && !isPast && 'border-muted text-muted-foreground',
                    isAccessible && !isCurrent && 'group-hover:border-primary/50'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    isCurrent && 'text-primary',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>

              {/* Connector line */}
              {index < STEP_ORDER.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 transition-colors',
                    index < currentIndex || completedSteps.has(step) ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Version compacte pour mobile
 */
export function StepIndicatorCompact({ className }: StepIndicatorProps) {
  const currentStep = useConsultationStore((s) => s.currentStep);
  const completedSteps = useConsultationStore((s) => s.completedSteps);

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const completedCount = completedSteps.size;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm font-medium text-muted-foreground">
        Étape {currentIndex + 1}/{STEP_ORDER.length}
      </span>
      <span className="text-sm font-medium text-primary">{STEP_LABELS[currentStep]}</span>
      {completedCount > 0 && (
        <span className="text-xs text-muted-foreground">
          ({completedCount} complétée{completedCount > 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
}
