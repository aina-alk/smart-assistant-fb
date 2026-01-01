import Link from 'next/link';
import {
  Users,
  FileText,
  CheckSquare,
  File,
  Search,
  Calendar,
  Pill,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'py-6',
    icon: 'h-8 w-8',
    iconWrapper: 'h-12 w-12',
    title: 'text-sm font-medium',
    description: 'text-xs',
  },
  md: {
    container: 'py-12',
    icon: 'h-10 w-10',
    iconWrapper: 'h-16 w-16',
    title: 'text-lg font-medium',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'h-12 w-12',
    iconWrapper: 'h-20 w-20',
    title: 'text-xl font-semibold',
    description: 'text-base',
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  const ActionButton = action ? (
    action.href ? (
      <Button asChild variant={action.variant || 'default'} size={size === 'sm' ? 'sm' : 'default'}>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    ) : (
      <Button
        onClick={action.onClick}
        variant={action.variant || 'default'}
        size={size === 'sm' ? 'sm' : 'default'}
      >
        {action.label}
      </Button>
    )
  ) : null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div
          className={cn(
            'mb-4 flex items-center justify-center rounded-full bg-muted',
            styles.iconWrapper
          )}
        >
          <Icon className={cn('text-muted-foreground', styles.icon)} />
        </div>
      )}
      <h3 className={cn('text-muted-foreground', styles.title)}>{title}</h3>
      {description && (
        <p className={cn('mt-1 max-w-sm text-muted-foreground', styles.description)}>
          {description}
        </p>
      )}
      {ActionButton && <div className="mt-4">{ActionButton}</div>}
    </div>
  );
}

// Predefined variants for common use cases
export const emptyStateVariants = {
  patients: {
    icon: Users,
    title: 'Aucun patient',
    description: 'Commencez par ajouter votre premier patient pour créer des consultations.',
    action: { label: '+ Ajouter un patient', href: '/medecin/patients/new' },
  },
  patientsSearch: {
    icon: Search,
    title: 'Aucun patient trouvé',
    description: 'Essayez de modifier vos critères de recherche.',
  },
  consultations: {
    icon: FileText,
    title: 'Aucune consultation',
    description: "Ce patient n'a pas encore de consultation enregistrée.",
  },
  taches: {
    icon: CheckSquare,
    title: 'Aucune tâche',
    description: "Vous n'avez aucune tâche en attente. Profitez-en !",
  },
  tachesUrgentes: {
    icon: CheckSquare,
    title: 'Aucune tâche urgente',
    description: 'Toutes vos tâches urgentes sont terminées.',
  },
  documents: {
    icon: File,
    title: 'Aucun document',
    description: "Cette consultation n'a pas encore de document généré.",
  },
  search: {
    icon: Search,
    title: 'Aucun résultat',
    description: 'Aucun résultat ne correspond à votre recherche.',
  },
  rendezVous: {
    icon: Calendar,
    title: 'Aucun rendez-vous',
    description: "Aucun rendez-vous programmé pour aujourd'hui.",
  },
  medicaments: {
    icon: Pill,
    title: 'Aucun médicament',
    description: 'Ajoutez des médicaments pour créer une ordonnance.',
  },
  examens: {
    icon: Stethoscope,
    title: 'Aucun examen prescrit',
    description: 'Ajoutez des examens complémentaires si nécessaire.',
  },
} as const;

// Convenience component for predefined variants
interface EmptyStateVariantProps {
  variant: keyof typeof emptyStateVariants;
  action?: EmptyStateAction;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyStatePreset({ variant, action, className, size }: EmptyStateVariantProps) {
  const config = emptyStateVariants[variant];
  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      action={action || ('action' in config ? config.action : undefined)}
      className={className}
      size={size}
    />
  );
}
