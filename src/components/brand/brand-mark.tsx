/**
 * BrandMark - Logo textuel Selav
 * Typographie professionnelle sans icône
 */

import { cn } from '@/lib/utils';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
  tagline?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function BrandMark({
  size = 'md',
  className,
  showTagline = false,
  tagline = 'Documentation médicale IA',
}: BrandMarkProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span
        className={cn('font-brand font-semibold tracking-tight text-foreground', sizeClasses[size])}
      >
        Selav
      </span>
      {showTagline && <span className="text-xs text-muted-foreground">{tagline}</span>}
    </div>
  );
}
