'use client';

/**
 * Formulaire d'inscription multi-étapes
 * Orchestre les 3 étapes : Identité, Profil, Disponibilités
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepIndicator } from './step-indicator';
import { StepIdentity } from './step-identity';
import { StepProfile } from './step-profile';
import { StepAvailability } from './step-availability';
import { useRegistration } from '@/lib/hooks/use-registration';
import { ArrowLeft, ArrowRight, Loader2, Send, AlertCircle } from 'lucide-react';

const STEP_LABELS = ['Identité', 'Profil', 'Disponibilités'];

export function RegistrationForm() {
  const {
    formData,
    currentStep,
    totalSteps,
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
    submit,
  } = useRegistration();

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      submit();
    } else {
      nextStep();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        {/* Indicateur d'étapes */}
        <div className="mb-8">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            labels={STEP_LABELS}
            onStepClick={goToStep}
          />
        </div>

        {/* Erreur de soumission */}
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Contenu de l'étape */}
        <div className="min-h-[300px]">
          {currentStep === 0 && (
            <StepIdentity
              data={{
                displayName: formData.displayName,
                email: formData.email,
                phone: formData.phone,
              }}
              errors={errors}
              onUpdate={updateField}
            />
          )}

          {currentStep === 1 && (
            <StepProfile
              role={formData.role}
              medecinData={formData.medecinData}
              secretaireData={formData.secretaireData}
              technicienData={formData.technicienData}
              errors={errors}
              onRoleChange={setRole}
              onMedecinUpdate={updateMedecinData}
              onSecretaireUpdate={updateSecretaireData}
              onTechnicienUpdate={updateTechnicienData}
            />
          )}

          {currentStep === 2 && (
            <StepAvailability
              callbackSlots={formData.callbackSlots}
              callbackNote={formData.callbackNote}
              acceptContact={formData.acceptContact}
              acceptTerms={formData.acceptTerms}
              errors={errors}
              onToggleSlot={toggleCallbackSlot}
              onUpdate={updateField}
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        {/* Bouton Précédent */}
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep || isSubmitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </Button>

        {/* Bouton Suivant / Soumettre */}
        <Button type="button" onClick={handleNext} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : isLastStep ? (
            <>
              <Send className="h-4 w-4" />
              Envoyer ma demande
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
