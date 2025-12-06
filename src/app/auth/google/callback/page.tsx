'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/provider';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`${t('auth.googleAuthFailed')}: ${errorParam}`);
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError(t('auth.noAuthCode'));
        setIsProcessing(false);
        return;
      }

      try {
        // Exchange code for tokens via our backend
        const response = await authApi.googleCallback(code);
        
        // Store tokens
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // Fetch user info
        const userInfo = await authApi.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        router.push('/dashboard/overview');
      } catch (err: any) {
        console.error('Google callback error:', err);
        setError(err.message || t('auth.googleAuthFailed'));
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router, t]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/sign-in')} 
            className="w-full"
          >
            {t('auth.backToSignIn')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          {t('auth.completingGoogleSignIn')}
        </p>
      </div>
    </div>
  );
}
