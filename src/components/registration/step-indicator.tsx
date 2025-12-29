'use client';

/**
 * Indicateur visuel des étapes du formulaire d'inscription
 * Affiche la progression avec des cercles connectés
 */

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              {/* Cercle de l'étape */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-105',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </button>

              {/* Ligne de connexion */}
              {index < totalSteps - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      'h-0.5 w-full transition-colors duration-200',
                      index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels sous les cercles */}
      <div className="flex justify-between mt-2">
        {labels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={cn(
                'text-xs font-medium text-center transition-colors duration-200',
                'w-10', // Même largeur que le cercle pour alignement
                index === 0 && 'text-left',
                index === labels.length - 1 && 'text-right',
                index > 0 && index < labels.length - 1 && 'flex-1',
                isCompleted && 'text-primary',
                isCurrent && 'text-primary font-semibold',
                !isCompleted && !isCurrent && 'text-muted-foreground'
              )}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
