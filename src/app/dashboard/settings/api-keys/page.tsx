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
import { Eye, EyeOff, Save, Check, X, Loader2, Key, ExternalLink } from 'lucide-react';
import { settingsApi } from '@/lib/api';
import { HelpTooltip } from '@/components/help-tooltip';

interface ApiKeyState {
  value: string;
  isSet: boolean;
  showValue: boolean;
  isSaving: boolean;
  isTesting: boolean;
  testResult?: 'success' | 'error';
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
];

export default function ApiSettingsPage() {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKeyState>>({
    openai: { value: '', isSet: false, showValue: false, isSaving: false, isTesting: false },
    gemini: { value: '', isSet: false, showValue: false, isSaving: false, isTesting: false },
    deepseek: { value: '', isSet: false, showValue: false, isSaving: false, isTesting: false },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load existing API key status
  useEffect(() => {
    const loadKeyStatus = async () => {
      try {
        const status = await settingsApi.getApiKeyStatus();
        setApiKeys((prev) => ({
          ...prev,
          openai: { ...prev.openai, isSet: status.openai || false },
          gemini: { ...prev.gemini, isSet: status.gemini || false },
          deepseek: { ...prev.deepseek, isSet: status.deepseek || false },
        }));
      } catch (error) {
        console.error('Failed to load API key status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadKeyStatus();
  }, []);

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], value, testResult: undefined },
    }));
  };

  const toggleShowValue = (provider: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], showValue: !prev[provider].showValue },
    }));
  };

  const handleSaveKey = async (provider: string) => {
    const keyState = apiKeys[provider];
    if (!keyState.value.trim()) return;

    setApiKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isSaving: true },
    }));

    try {
      await settingsApi.updateApiKey(provider, keyState.value);
      setApiKeys((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isSet: true,
          isSaving: false,
          value: '',
          showValue: false,
        },
      }));
      setGlobalError(null);
    } catch (error: any) {
      setGlobalError(error.message || `Failed to save ${provider} API key`);
      setApiKeys((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], isSaving: false },
      }));
    }
  };

  const handleTestKey = async (provider: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isTesting: true, testResult: undefined },
    }));

    try {
      const result = await settingsApi.testApiKey(provider);
      setApiKeys((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isTesting: false,
          testResult: result.valid ? 'success' : 'error',
        },
      }));
    } catch (error) {
      setApiKeys((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], isTesting: false, testResult: 'error' },
      }));
    }
  };

  const handleDeleteKey = async (provider: string) => {
    if (!confirm(`Are you sure you want to delete the ${provider} API key?`)) return;

    try {
      await settingsApi.deleteApiKey(provider);
      setApiKeys((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isSet: false,
          value: '',
          testResult: undefined,
        },
      }));
    } catch (error: any) {
      setGlobalError(error.message || `Failed to delete ${provider} API key`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Key className="h-6 w-6" />
          {t('settings.apiKeys')}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t('settings.apiKeyDescription')}
        </p>
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {API_KEY_CONFIGS.map((config) => {
          const keyState = apiKeys[config.id];
          
          return (
            <Card key={config.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <Badge variant={keyState.isSet ? 'default' : 'secondary'}>
                      {keyState.isSet ? t('settings.keyConfigured') : t('settings.keyNotConfigured')}
                    </Badge>
                    {keyState.testResult === 'success' && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Check className="h-3 w-3 mr-1" /> Valid
                      </Badge>
                    )}
                    {keyState.testResult === 'error' && (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <X className="h-3 w-3 mr-1" /> Invalid
                      </Badge>
                    )}
                  </div>
                  <a
                    href={config.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    Get API Key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={keyState.showValue ? 'text' : 'password'}
                      placeholder={keyState.isSet ? '••••••••••••••••' : config.placeholder}
                      value={keyState.value}
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
                      {keyState.showValue ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => handleSaveKey(config.id)}
                    disabled={!keyState.value.trim() || keyState.isSaving}
                  >
                    {keyState.isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('settings.saveKey')}
                      </>
                    )}
                  </Button>

                  {keyState.isSet && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleTestKey(config.id)}
                        disabled={keyState.isTesting}
                      >
                        {keyState.isTesting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('settings.testKey')
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteKey(config.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Usage Notes
            <HelpTooltip content="Important information about using AI features" />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• API keys are stored securely on the server and are never exposed to the browser.</p>
          <p>• Each AI provider has different pricing. Check their documentation for details.</p>
          <p>• OpenAI (GPT-4) provides the most advanced capabilities but at a higher cost.</p>
          <p>• Google Gemini offers competitive performance with good pricing.</p>
          <p>• DeepSeek provides cost-effective options for high-volume usage.</p>
        </CardContent>
      </Card>
    </div>
  );
}
