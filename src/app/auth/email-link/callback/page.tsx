/**
 * Page de callback pour l'authentification par lien email
 * Cette page est appelée quand l'utilisateur clique sur le lien dans son email
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

// Clé localStorage pour récupérer l'email stocké
const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

type CallbackState = 'loading' | 'need_email' | 'success' | 'error';

export default function EmailLinkCallbackPage() {
  const { completeEmailLinkSignIn, isEmailLinkSignIn, user, loading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<CallbackState>('loading');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
    if (user && !loading) {
      router.push('/');
      return;
    }

    // Attendre que le contexte auth soit chargé
    if (loading) return;

    const currentUrl = window.location.href;

    // Vérifier si c'est bien un lien de connexion email
    if (!isEmailLinkSignIn(currentUrl)) {
      setState('error');
      setErrorMessage("Ce lien n'est pas valide ou a expiré.");
      return;
    }

    // Récupérer l'email stocké dans localStorage
    const storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);

    if (storedEmail) {
      // Si l'email est stocké, finaliser automatiquement la connexion
      handleSignIn(storedEmail, currentUrl);
    } else {
      // Sinon, demander l'email à l'utilisateur (sécurité)
      setState('need_email');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const handleSignIn = async (emailToUse: string, link: string) => {
    try {
      setIsProcessing(true);
      await completeEmailLinkSignIn(emailToUse, link);
      setState('success');
      toast.success('Connexion réussie !');

      // Rediriger après un court délai
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setState('error');

      // Messages d'erreur personnalisés
      const errorCode = (error as { code?: string }).code;
      if (errorCode === 'auth/invalid-action-code') {
        setErrorMessage('Ce lien de connexion a expiré ou a déjà été utilisé.');
      } else if (errorCode === 'auth/invalid-email') {
        setErrorMessage("L'adresse email ne correspond pas à celle utilisée pour la demande.");
      } else {
        setErrorMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide.');
      return;
    }

    handleSignIn(email, window.location.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Connexion par email</CardTitle>
          <CardDescription>Selav</CardDescription>
        </CardHeader>
        <CardContent>
          {state === 'loading' && (
            <div className="flex flex-col items-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Vérification du lien...</p>
            </div>
          )}

          {state === 'need_email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Pour des raisons de sécurité, veuillez confirmer votre adresse email.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-email">Adresse email</Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="votre@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" disabled={isProcessing || !email} className="w-full h-12">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Confirmer et se connecter'
                )}
              </Button>
            </form>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Connexion réussie !</p>
                <p className="text-sm text-muted-foreground mt-1">Redirection en cours...</p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Erreur de connexion</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/login')} className="mt-2">
                Retourner à la page de connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
