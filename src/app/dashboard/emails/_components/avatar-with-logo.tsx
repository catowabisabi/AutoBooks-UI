'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { EmailSender } from '@/types/email';
import SenderProfile from './sender-profile';

interface AvatarWithLogoProps {
  sender: EmailSender;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarWithLogo({
  sender,
  size = 'md',
  className = ''
}: AvatarWithLogoProps) {
  const [showProfile, setShowProfile] = useState(false);

  // Determine avatar size
  const avatarSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  // Determine logo size
  const logoSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-5.5 w-5.5'
  };

  return (
    <>
      <div
        className={`relative ${className} cursor-pointer transition-opacity hover:opacity-90`}
        onClick={(e) => {
          e.stopPropagation();
          setShowProfile(true);
        }}
      >
        <Avatar className={avatarSizeClasses[size]}>
          <AvatarImage
            src={sender.avatar || '/placeholder.svg'}
            alt={sender.name}
          />
          <AvatarFallback>
            {sender.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>

        {sender.organization && (
          <div className='border-background absolute -right-1 -bottom-1 rounded-full border-2'>
            <div
              className={`${logoSizeClasses[size]} ring-background flex items-center justify-center overflow-hidden rounded-full bg-white ring-2`}
            >
              <img
                src={sender.organization.logo || '/placeholder.svg'}
                alt={sender.organization.name}
                className='h-full w-full object-cover'
              />
            </div>
          </div>
        )}
      </div>

      <SenderProfile
        sender={sender}
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}
