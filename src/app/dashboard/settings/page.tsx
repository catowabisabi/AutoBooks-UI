'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconKey, IconPalette, IconBell, IconShield } from '@tabler/icons-react';
import Link from 'next/link';

const settingsCategories = [
  {
    title: 'API Keys',
    description: 'Manage your AI service API keys',
    icon: IconKey,
    href: '/dashboard/settings/api-keys',
  },
  {
    title: 'Appearance',
    description: 'Customize the look and feel of your dashboard',
    icon: IconPalette,
    href: '/dashboard/settings/appearance',
  },
  {
    title: 'Notifications',
    description: 'Configure notification preferences',
    icon: IconBell,
    href: '/dashboard/settings/notifications',
  },
  {
    title: 'Security',
    description: 'Manage security settings and two-factor authentication',
    icon: IconShield,
    href: '/dashboard/settings/security',
  },
];

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <Heading title="Settings" description="Manage your account settings and preferences" />
        </div>
        <Separator />
        
        <div className="grid gap-4 md:grid-cols-2">
          {settingsCategories.map((category) => (
            <Link key={category.title} href={category.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
