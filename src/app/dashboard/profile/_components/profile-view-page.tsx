'use client';

import { useTranslation } from '@/lib/i18n/provider';

export default function ProfileViewPage() {
  const { t } = useTranslation();
  const user = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    imageUrl: 'https://github.com/shadcn.png'
  };

  return (
    <div className='flex w-full flex-col gap-4 p-4'>
      <h1 className='text-2xl font-semibold'>{t('sidebar.profile')}</h1>
      <div className='flex items-center gap-4'>
        <img
          src={user.imageUrl}
          alt='Profile'
          className='h-16 w-16 rounded-full border'
        />
        <div>
          <p className='text-lg font-medium'>{user.fullName}</p>
          <p className='text-muted-foreground text-sm'>{user.email}</p>
        </div>
      </div>
    </div>
  );
}
