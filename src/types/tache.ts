/**
 * Types Tâche - Format application et mapping FHIR Task
 */

// ============================================================================
// Types Application
// ============================================================================

export type TachePriorite = 'basse' | 'normale' | 'haute' | 'urgente';
export type TacheStatut = 'a_faire' | 'en_cours' | 'terminee' | 'annulee';
export type TacheCategorie = 'rappel' | 'suivi' | 'administratif' | 'medical' | 'autre';

export interface Tache {
  id: string;
  titre: string;
  description?: string;
  priorite: TachePriorite;
  statut: TacheStatut;
  categorie: TacheCategorie;
  echeance?: Date;
  rappel?: Date;
  patientId?: string;
  consultationId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TacheCreate = Omit<Tache, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

export type TacheUpdate = Partial<Omit<Tache, 'id' | 'createdAt' | 'updatedAt'>>;

export interface TacheSearchResult {
  taches: Tache[];
  total: number;
  nextPageToken?: string;
}

// ============================================================================
// Types FHIR Task
// ============================================================================

export type FHIRTaskStatus = 'draft' | 'requested' | 'in-progress' | 'completed' | 'cancelled';
export type FHIRTaskPriority = 'routine' | 'urgent' | 'asap' | 'stat';

export interface FHIRTaskExtension {
  url: string;
  valueDateTime?: string;
  valueString?: string;
}

export interface FHIRTask {
  resourceType: 'Task';
  id?: string;
  meta?: {
    lastUpdated?: string;
  };
  status: FHIRTaskStatus;
  intent: 'proposal' | 'plan' | 'order';
  priority: FHIRTaskPriority;
  code?: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  description?: string;
  for?: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  authoredOn?: string;
  lastModified?: string;
  restriction?: {
    period?: {
      end?: string;
    };
  };
  extension?: FHIRTaskExtension[];
  executionPeriod?: {
    end?: string;
  };
}

// ============================================================================
// Constantes FHIR
// ============================================================================

export const TASK_CATEGORY_SYSTEM =
  'https://super-assistant-medical.fr/fhir/CodeSystem/task-category';

export const TASK_EXTENSION_URLS = {
  rappel: 'https://super-assistant-medical.fr/fhir/StructureDefinition/task-reminder',
  titre: 'https://super-assistant-medical.fr/fhir/StructureDefinition/task-title',
} as const;

// ============================================================================
// Mapping Statut ↔ FHIR
// ============================================================================

const STATUT_TO_FHIR: Record<TacheStatut, FHIRTaskStatus> = {
  a_faire: 'requested',
  en_cours: 'in-progress',
  terminee: 'completed',
  annulee: 'cancelled',
};

const FHIR_TO_STATUT: Record<FHIRTaskStatus, TacheStatut> = {
  draft: 'a_faire',
  requested: 'a_faire',
  'in-progress': 'en_cours',
  completed: 'terminee',
  cancelled: 'annulee',
};

// ============================================================================
// Mapping Priorité ↔ FHIR
// ============================================================================

const PRIORITE_TO_FHIR: Record<TachePriorite, FHIRTaskPriority> = {
  basse: 'routine',
  normale: 'routine',
  haute: 'urgent',
  urgente: 'stat',
};

const FHIR_TO_PRIORITE: Record<FHIRTaskPriority, TachePriorite> = {
  routine: 'normale',
  urgent: 'haute',
  asap: 'haute',
  stat: 'urgente',
};

// ============================================================================
// Mapping Catégorie ↔ FHIR
// ============================================================================

const CATEGORIE_DISPLAY: Record<TacheCategorie, string> = {
  rappel: 'Rappel',
  suivi: 'Suivi',
  administratif: 'Administratif',
  medical: 'Médical',
  autre: 'Autre',
};

// ============================================================================
// Mapping Tache ↔ FHIR Task
// ============================================================================

export function tacheToFHIR(tache: Tache | TacheCreate, id?: string): FHIRTask {
  const task: FHIRTask = {
    resourceType: 'Task',
    status: STATUT_TO_FHIR[tache.statut],
    intent: 'order',
    priority: PRIORITE_TO_FHIR[tache.priorite],
  };

  if ('id' in tache && tache.id) {
    task.id = tache.id;
  } else if (id) {
    task.id = id;
  }

  task.code = {
    coding: [
      {
        system: TASK_CATEGORY_SYSTEM,
        code: tache.categorie,
        display: CATEGORIE_DISPLAY[tache.categorie],
      },
    ],
  };

  task.description = tache.description;

  if (tache.patientId) {
    task.for = {
      reference: `Patient/${tache.patientId}`,
    };
  }

  if (tache.consultationId) {
    task.encounter = {
      reference: `Encounter/${tache.consultationId}`,
    };
  }

  if (tache.echeance) {
    task.restriction = {
      period: {
        end: tache.echeance.toISOString(),
      },
    };
  }

  if ('completedAt' in tache && tache.completedAt) {
    task.executionPeriod = {
      end: tache.completedAt.toISOString(),
    };
  }

  const extensions: FHIRTaskExtension[] = [];

  extensions.push({
    url: TASK_EXTENSION_URLS.titre,
    valueString: tache.titre,
  });

  if (tache.rappel) {
    extensions.push({
      url: TASK_EXTENSION_URLS.rappel,
      valueDateTime: tache.rappel.toISOString(),
    });
  }

  if (extensions.length > 0) {
    task.extension = extensions;
  }

  return task;
}

export function fhirToTache(task: FHIRTask): Tache {
  const statut = FHIR_TO_STATUT[task.status] || 'a_faire';
  const priorite = FHIR_TO_PRIORITE[task.priority] || 'normale';

  const categorieCode = task.code?.coding?.[0]?.code as TacheCategorie | undefined;
  const categorie: TacheCategorie = categorieCode || 'autre';

  const extensionMap = new Map<string, string>();
  task.extension?.forEach((ext) => {
    if (ext.valueString) {
      extensionMap.set(ext.url, ext.valueString);
    } else if (ext.valueDateTime) {
      extensionMap.set(ext.url, ext.valueDateTime);
    }
  });

  const titre = extensionMap.get(TASK_EXTENSION_URLS.titre) || task.description || '';
  const rappelStr = extensionMap.get(TASK_EXTENSION_URLS.rappel);
  const rappel = rappelStr ? new Date(rappelStr) : undefined;

  const echeanceStr = task.restriction?.period?.end;
  const echeance = echeanceStr ? new Date(echeanceStr) : undefined;

  const completedAtStr = task.executionPeriod?.end;
  const completedAt = completedAtStr ? new Date(completedAtStr) : undefined;

  const patientId = extractIdFromReference(task.for?.reference);
  const consultationId = extractIdFromReference(task.encounter?.reference);

  const lastUpdated = task.meta?.lastUpdated;
  const updatedAt = lastUpdated ? new Date(lastUpdated) : new Date();
  const authoredOn = task.authoredOn;
  const createdAt = authoredOn ? new Date(authoredOn) : updatedAt;

  return {
    id: task.id || '',
    titre,
    description: task.description,
    priorite,
    statut,
    categorie,
    echeance,
    rappel,
    patientId: patientId || undefined,
    consultationId: consultationId || undefined,
    createdAt,
    updatedAt,
    completedAt,
  };
}

// ============================================================================
// Utilitaires
// ============================================================================

function extractIdFromReference(reference: string | undefined): string {
  if (!reference) return '';
  const parts = reference.split('/');
  return parts[parts.length - 1] || '';
}

export function isTacheEditable(tache: Tache): boolean {
  return tache.statut !== 'terminee' && tache.statut !== 'annulee';
}

export function isTacheUrgente(tache: Tache): boolean {
  return tache.priorite === 'urgente' || tache.priorite === 'haute';
}

export function getTachePrioriteLabel(priorite: TachePriorite): string {
  const labels: Record<TachePriorite, string> = {
    basse: 'Basse',
    normale: 'Normale',
    haute: 'Haute',
    urgente: 'Urgente',
  };
  return labels[priorite];
}

export function getTacheStatutLabel(statut: TacheStatut): string {
  const labels: Record<TacheStatut, string> = {
    a_faire: 'À faire',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
  };
  return labels[statut];
}

export function getTacheCategorieLabel(categorie: TacheCategorie): string {
  return CATEGORIE_DISPLAY[categorie];
}
