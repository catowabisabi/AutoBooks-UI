'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Save, Check, X, Loader2, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { HelpTooltip } from '@/components/help-tooltip';
import { useApiKeyStatus, useUpdateApiKey, useTestApiKey } from '@/features/settings/hooks';
import { toast } from 'sonner';

interface ApiKeyState {
  value: string;
  showValue: boolean;
}

const API_KEY_CONFIGS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 models for advanced AI capabilities',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google AI models for text and image understanding',
    placeholder: 'AI...',
    docsUrl: 'https://makersuite.google.com/app/apikey',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Cost-effective AI models with strong performance',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models for high-quality reasoning',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
];

export default function ApiSettingsPage() {
  const { t } = useTranslation();
  const { data: statusList, isLoading: isLoadingStatus, refetch } = useApiKeyStatus();
  const updateKeyMutation = useUpdateApiKey();
  const testKeyMutation = useTestApiKey();

  const [localState, setLocalState] = useState<Record<string, ApiKeyState>>({});

  // Initialize local state for inputs
  useEffect(() => {
    const initialState: Record<string, ApiKeyState> = {};
    API_KEY_CONFIGS.forEach(config => {
      initialState[config.id] = { value: '', showValue: false };
    });
    setLocalState(initialState);
  }, []);

  const getProviderStatus = (providerId: string) => {
    // Handle both array responses and object responses with data property
    const list = Array.isArray(statusList) ? statusList : (statusList as any)?.data;
    if (!Array.isArray(list)) return undefined;
    return list.find((s: any) => s.provider === providerId);
  };

  const handleKeyChange = (provider: string, value: string) => {
    setLocalState((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], value },
    }));
  };

  const toggleShowValue = (provider: string) => {
    setLocalState((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], showValue: !prev[provider].showValue },
    }));
  };

  const handleSaveKey = async (provider: string) => {
    const keyState = localState[provider];
    if (!keyState?.value.trim()) return;

    try {
      await updateKeyMutation.mutateAsync({ provider, key: keyState.value });
      toast.success(t('API key saved successfully'));
      setLocalState(prev => ({
        ...prev,
        [provider]: { ...prev[provider], value: '' } // Clear input after save for security
      }));
    } catch (error) {
      console.error(error);
      toast.error(t('Failed to save API key'));
    }
  };

  const handleTestKey = async (provider: string) => {
    try {
      const result = await testKeyMutation.mutateAsync(provider);
      if (result.success) {
        toast.success(t('API key is valid and working'));
        refetch();
      } else {
        toast.error(t('API key validation failed: ') + result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('Failed to test API key'));
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium">{t('AI Provider Settings')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('Configure API keys for various AI providers to enable advanced features.')}
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {API_KEY_CONFIGS.map((config) => {
          const status = getProviderStatus(config.id);
          const state = localState[config.id] || { value: '', showValue: false };
          const isSaving = updateKeyMutation.isPending && updateKeyMutation.variables?.provider === config.id;
          const isTesting = testKeyMutation.isPending && testKeyMutation.variables === config.id;

          return (
            <Card key={config.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    {status?.is_configured ? (
                      <Badge variant={status.is_valid ? "default" : "destructive"} className="ml-2">
                        {status.is_valid ? t('Active') : t('Invalid')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 text-muted-foreground">
                        {t('Not Configured')}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <span className="text-xs">{t('Get Key')}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <CardDescription>{t(config.description)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Input
                      type={state.showValue ? 'text' : 'password'}
                      placeholder={status?.is_configured ? '••••••••••••••••' : config.placeholder}
                      value={state.value}
                      onChange={(e) => handleKeyChange(config.id, e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => toggleShowValue(config.id)}
                    >
                      {state.showValue ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveKey(config.id)}
                      disabled={!state.value || isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {t('Save')}
                    </Button>
                    {status?.is_configured && (
                      <Button
                        variant="outline"
                        onClick={() => handleTestKey(config.id)}
                        disabled={isTesting}
                      >
                        {isTesting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        {t('Test')}
                      </Button>
                    )}
                  </div>
                </div>
                {status?.last_checked && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('Last checked:')} {new Date(status.last_checked).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
