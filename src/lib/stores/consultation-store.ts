/**
 * Consultation Store - État global du workflow de consultation
 *
 * Ce store orchestre le workflow complet:
 * Patient → Dictée → CRC → Codage → Validation
 */

'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Patient } from '@/types/patient';
import type { CRCGenerated } from '@/types/generation';
import type { DiagnosticSelection, CodageConsultation } from '@/types/codage';

// ============================================================================
// Types
// ============================================================================

export type ConsultationStep =
  | 'patient' // Étape 1: Sélection patient
  | 'dictation' // Étape 2: Dictée + transcription
  | 'crc' // Étape 3: CRC + diagnostics
  | 'codage' // Étape 4: Codage actes
  | 'validation'; // Étape 5: Récapitulatif + validation

export const STEP_ORDER: ConsultationStep[] = [
  'patient',
  'dictation',
  'crc',
  'codage',
  'validation',
];

export const STEP_LABELS: Record<ConsultationStep, string> = {
  patient: 'Patient',
  dictation: 'Dictée',
  crc: 'CRC',
  codage: 'Codage',
  validation: 'Valider',
};

interface ConsultationState {
  // Identifiants
  consultationId: string | null;

  // Patient
  patientId: string | null;
  patient: Patient | null;

  // Contenu médical
  transcription: string;
  crc: CRCGenerated | null;
  diagnostics: DiagnosticSelection | null;
  codage: CodageConsultation | null;
  motif: string;

  // Workflow
  currentStep: ConsultationStep;
  completedSteps: Set<ConsultationStep>;

  // État UI
  isGeneratingCRC: boolean;
  isExtractingDiagnostics: boolean;
  isSuggestingCodage: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;

  // Erreurs
  error: string | null;
}

interface ConsultationActions {
  // Patient
  setPatient: (patient: Patient) => void;
  clearPatient: () => void;

  // Contenu
  setMotif: (motif: string) => void;
  setTranscription: (text: string) => void;
  setCRC: (crc: CRCGenerated) => void;
  updateCRCField: (field: keyof CRCGenerated, value: string) => void;
  setDiagnostics: (diagnostics: DiagnosticSelection) => void;
  setCodage: (codage: CodageConsultation) => void;

  // Workflow
  goToStep: (step: ConsultationStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  markStepComplete: (step: ConsultationStep) => void;

  // État
  setIsGeneratingCRC: (value: boolean) => void;
  setIsExtractingDiagnostics: (value: boolean) => void;
  setIsSuggestingCodage: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  markAsModified: () => void;
  markAsSaved: () => void;
  setError: (error: string | null) => void;

  // Lifecycle
  setConsultationId: (id: string) => void;
  loadConsultation: (id: string, data: Partial<ConsultationState>) => void;
  reset: () => void;

  // Helpers
  canProceedTo: (step: ConsultationStep) => boolean;
  getStepIndex: (step: ConsultationStep) => number;
  isStepAccessible: (step: ConsultationStep) => boolean;
}

type ConsultationStore = ConsultationState & ConsultationActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: ConsultationState = {
  consultationId: null,
  patientId: null,
  patient: null,
  transcription: '',
  crc: null,
  diagnostics: null,
  codage: null,
  motif: '',
  currentStep: 'patient',
  completedSteps: new Set(),
  isGeneratingCRC: false,
  isExtractingDiagnostics: false,
  isSuggestingCodage: false,
  isSaving: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  error: null,
};

// ============================================================================
// Store
// ============================================================================

export const useConsultationStore = create<ConsultationStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ========================================================================
    // Patient Actions
    // ========================================================================

    setPatient: (patient) => {
      set({
        patient,
        patientId: patient.id,
        hasUnsavedChanges: true,
      });
      get().markStepComplete('patient');
    },

    clearPatient: () => {
      set({
        patient: null,
        patientId: null,
        hasUnsavedChanges: true,
      });
    },

    // ========================================================================
    // Content Actions
    // ========================================================================

    setMotif: (motif) => {
      set({ motif, hasUnsavedChanges: true });
    },

    setTranscription: (transcription) => {
      set({ transcription, hasUnsavedChanges: true });
      if (transcription.length > 50) {
        get().markStepComplete('dictation');
      }
    },

    setCRC: (crc) => {
      set({ crc, hasUnsavedChanges: true });
      get().markStepComplete('crc');
    },

    updateCRCField: (field, value) => {
      const { crc } = get();
      if (!crc) return;

      set({
        crc: { ...crc, [field]: value },
        hasUnsavedChanges: true,
      });
    },

    setDiagnostics: (diagnostics) => {
      set({ diagnostics, hasUnsavedChanges: true });
    },

    setCodage: (codage) => {
      set({ codage, hasUnsavedChanges: true });
      get().markStepComplete('codage');
    },

    // ========================================================================
    // Workflow Actions
    // ========================================================================

    goToStep: (step) => {
      if (get().isStepAccessible(step)) {
        set({ currentStep: step });
      }
    },

    nextStep: () => {
      const { currentStep } = get();
      const currentIndex = STEP_ORDER.indexOf(currentStep);
      const nextStep = STEP_ORDER[currentIndex + 1];

      if (nextStep && get().isStepAccessible(nextStep)) {
        set({ currentStep: nextStep });
      }
    },

    prevStep: () => {
      const { currentStep } = get();
      const currentIndex = STEP_ORDER.indexOf(currentStep);
      const prevStep = STEP_ORDER[currentIndex - 1];

      if (prevStep) {
        set({ currentStep: prevStep });
      }
    },

    markStepComplete: (step) => {
      set((state) => ({
        completedSteps: new Set([...state.completedSteps, step]),
      }));
    },

    // ========================================================================
    // State Actions
    // ========================================================================

    setIsGeneratingCRC: (isGeneratingCRC) => set({ isGeneratingCRC }),
    setIsExtractingDiagnostics: (isExtractingDiagnostics) => set({ isExtractingDiagnostics }),
    setIsSuggestingCodage: (isSuggestingCodage) => set({ isSuggestingCodage }),
    setIsSaving: (isSaving) => set({ isSaving }),
    setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
    markAsModified: () => set({ hasUnsavedChanges: true }),
    markAsSaved: () => set({ hasUnsavedChanges: false, lastSavedAt: new Date() }),
    setError: (error) => set({ error }),

    // ========================================================================
    // Lifecycle Actions
    // ========================================================================

    setConsultationId: (id) => {
      set({ consultationId: id });
    },

    loadConsultation: (id, data) => {
      set({
        consultationId: id,
        ...data,
        hasUnsavedChanges: false,
      });
    },

    reset: () => {
      set({
        ...initialState,
        completedSteps: new Set(),
      });
    },

    // ========================================================================
    // Helpers
    // ========================================================================

    canProceedTo: (step) => {
      const state = get();

      switch (step) {
        case 'patient':
          return true;
        case 'dictation':
          return !!state.patient;
        case 'crc':
          return !!state.patient && state.transcription.length > 50;
        case 'codage':
          return !!state.crc;
        case 'validation':
          return !!state.crc && !!state.codage;
        default:
          return false;
      }
    },

    getStepIndex: (step) => STEP_ORDER.indexOf(step),

    isStepAccessible: (step) => {
      const state = get();
      const stepIndex = STEP_ORDER.indexOf(step);
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);

      // Peut toujours revenir en arrière
      if (stepIndex <= currentIndex) return true;

      // Peut avancer seulement si les pré-requis sont remplis
      return state.canProceedTo(step);
    },
  }))
);

// ============================================================================
// Selectors (pour optimisation des re-renders)
// ============================================================================

export const selectPatient = (state: ConsultationStore) => state.patient;
export const selectTranscription = (state: ConsultationStore) => state.transcription;
export const selectCRC = (state: ConsultationStore) => state.crc;
export const selectDiagnostics = (state: ConsultationStore) => state.diagnostics;
export const selectCodage = (state: ConsultationStore) => state.codage;
export const selectCurrentStep = (state: ConsultationStore) => state.currentStep;
export const selectIsLoading = (state: ConsultationStore) =>
  state.isGeneratingCRC ||
  state.isExtractingDiagnostics ||
  state.isSuggestingCodage ||
  state.isSaving;
