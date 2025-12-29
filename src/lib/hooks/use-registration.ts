/**
 * Hook de gestion du formulaire d'inscription multi-étapes
 * Gère l'état, la validation, la persistance localStorage et la soumission
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { createUserDocument } from '@/lib/firebase/registration';
import { validateStep, getStepData, normalizePhone } from '@/lib/validations/registration';
import type {
  RegistrationFormData,
  RegistrationRole,
  CallbackSlot,
  MedecinRegistrationData,
  SecretaireRegistrationData,
  TechnicienRegistrationData,
} from '@/types/registration';

// ===== CONSTANTES =====

const STORAGE_KEY = 'registration_form_data';
const TOTAL_STEPS = 3;

// ===== TYPES =====

interface UseRegistrationReturn {
  // État du formulaire
  formData: RegistrationFormData;
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  submitError: string | null;

  // Erreurs de validation
  errors: Record<string, string>;

  // Navigation
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Mise à jour des données
  updateField: <K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K]
  ) => void;
  updateMedecinData: (data: Partial<MedecinRegistrationData>) => void;
  updateSecretaireData: (data: Partial<SecretaireRegistrationData>) => void;
  updateTechnicienData: (data: Partial<TechnicienRegistrationData>) => void;
  setRole: (role: RegistrationRole) => void;
  toggleCallbackSlot: (slot: CallbackSlot) => void;

  // Validation
  validateCurrentStep: () => boolean;
  isStepValid: (step: number) => boolean;

  // Soumission
  submit: () => Promise<void>;

  // Reset
  reset: () => void;
}

// ===== VALEURS PAR DÉFAUT =====

const getDefaultFormData = (): RegistrationFormData => ({
  displayName: '',
  email: '',
  phone: '',
  role: null,
  medecinData: null,
  secretaireData: null,
  technicienData: null,
  callbackSlots: [],
  callbackNote: '',
  acceptContact: false,
  acceptTerms: false,
});

// ===== HELPERS LOCALSTORAGE =====

function loadFromStorage(): RegistrationFormData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as RegistrationFormData;
  } catch {
    return null;
  }
}

function saveToStorage(data: RegistrationFormData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

// ===== HOOK =====

export function useRegistration(): UseRegistrationReturn {
  const router = useRouter();
  const { user } = useAuth();

  // État du formulaire
  const [formData, setFormData] = useState<RegistrationFormData>(getDefaultFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setFormData(stored);
    }
    setInitialized(true);
  }, []);

  // Pré-remplir avec les données Google
  useEffect(() => {
    if (!initialized || !user) return;

    setFormData((prev) => ({
      ...prev,
      displayName: prev.displayName || user.displayName || '',
      email: user.email || '', // Email toujours depuis auth
    }));
  }, [user, initialized]);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (initialized) {
      saveToStorage(formData);
    }
  }, [formData, initialized]);

  // ===== MISE À JOUR DES DONNÉES =====

  const updateField = useCallback(
    <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Effacer l'erreur du champ modifié
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const setRole = useCallback((role: RegistrationRole) => {
    setFormData((prev) => {
      // Réinitialiser les données spécifiques selon le rôle
      const newData: RegistrationFormData = {
        ...prev,
        role,
        medecinData: role === 'medecin' ? { rpps: '', specialty: 'ORL', sector: 1 } : null,
        secretaireData: role === 'secretaire' ? { supervisorName: '' } : null,
        technicienData: role === 'technicien' ? { specialization: 'Audioprothésiste' } : null,
      };
      return newData;
    });
    setErrors({});
  }, []);

  const updateMedecinData = useCallback((data: Partial<MedecinRegistrationData>) => {
    setFormData((prev) => ({
      ...prev,
      medecinData: prev.medecinData ? { ...prev.medecinData, ...data } : null,
    }));
  }, []);

  const updateSecretaireData = useCallback((data: Partial<SecretaireRegistrationData>) => {
    setFormData((prev) => ({
      ...prev,
      secretaireData: prev.secretaireData ? { ...prev.secretaireData, ...data } : null,
    }));
  }, []);

  const updateTechnicienData = useCallback((data: Partial<TechnicienRegistrationData>) => {
    setFormData((prev) => ({
      ...prev,
      technicienData: prev.technicienData ? { ...prev.technicienData, ...data } : null,
    }));
  }, []);

  const toggleCallbackSlot = useCallback((slot: CallbackSlot) => {
    setFormData((prev) => {
      const slots = prev.callbackSlots.includes(slot)
        ? prev.callbackSlots.filter((s) => s !== slot)
        : [...prev.callbackSlots, slot];
      return { ...prev, callbackSlots: slots };
    });
  }, []);

  // ===== VALIDATION =====

  const validateCurrentStep = useCallback((): boolean => {
    const stepData = getStepData(currentStep, formData as unknown as Record<string, unknown>);
    const result = validateStep(currentStep, stepData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [currentStep, formData]);

  const isStepValid = useCallback(
    (step: number): boolean => {
      const stepData = getStepData(step, formData as unknown as Record<string, unknown>);
      const result = validateStep(step, stepData);
      return result.success;
    },
    [formData]
  );

  // ===== NAVIGATION =====

  const nextStep = useCallback((): boolean => {
    if (!validateCurrentStep()) {
      return false;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
      return true;
    }

    return false;
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      // On ne peut aller que vers une étape déjà validée ou la suivante
      if (step < 0 || step >= TOTAL_STEPS) return;

      // Vérifier que toutes les étapes précédentes sont valides
      for (let i = 0; i < step; i++) {
        if (!isStepValid(i)) {
          setCurrentStep(i);
          return;
        }
      }

      setCurrentStep(step);
      setErrors({});
    },
    [isStepValid]
  );

  // ===== SOUMISSION =====

  const submit = useCallback(async () => {
    // Valider l'étape finale
    if (!validateCurrentStep()) {
      return;
    }

    if (!user?.uid || !user?.email) {
      setSubmitError('Vous devez être connecté pour soumettre votre demande');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Créer le document utilisateur
      await createUserDocument({
        uid: user.uid,
        email: user.email,
        displayName: formData.displayName,
        phone: normalizePhone(formData.phone),
        role: formData.role!,
        callbackSlots: formData.callbackSlots,
        callbackNote: formData.callbackNote || null,
        medecinData: formData.medecinData,
        secretaireData: formData.secretaireData,
        technicienData: formData.technicienData,
      });

      // Nettoyer le localStorage
      clearStorage();

      // Rediriger vers la page de confirmation
      router.push('/demande-envoyee');
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setSubmitError(
        err instanceof Error ? err.message : 'Une erreur est survenue lors de la soumission'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [user, formData, validateCurrentStep, router]);

  // ===== RESET =====

  const reset = useCallback(() => {
    setFormData(getDefaultFormData());
    setCurrentStep(0);
    setErrors({});
    setSubmitError(null);
    clearStorage();
  }, []);

  return {
    formData,
    currentStep,
    totalSteps: TOTAL_STEPS,
    isSubmitting,
    submitError,
    errors,
    nextStep,
    prevStep,
    goToStep,
    updateField,
    updateMedecinData,
    updateSecretaireData,
    updateTechnicienData,
    setRole,
    toggleCallbackSlot,
    validateCurrentStep,
    isStepValid,
    submit,
    reset,
  };
}
