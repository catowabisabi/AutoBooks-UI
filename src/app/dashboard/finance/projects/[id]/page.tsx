'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import ProjectDetail from './_components/project-detail';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Suspense
        fallback={
          <div className='flex h-[400px] items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </div>
        }
      >
        <ProjectDetail projectId={projectId} />
      </Suspense>
    </div>
  );
}
