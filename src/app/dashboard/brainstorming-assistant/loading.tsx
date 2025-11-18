import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className='flex flex-1 flex-col space-y-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          <Skeleton className='h-8 w-64' />
        </h2>
      </div>

      <div className='mb-6 flex items-center justify-between'>
        <Skeleton className='h-10 w-64' />
        <div className='flex gap-4'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-40' />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className='border border-gray-200 bg-white'>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-start justify-between'>
                  <Skeleton className='h-12 w-12 rounded-xl' />
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-8 w-24' />
                    <Skeleton className='h-8 w-8' />
                  </div>
                </div>

                <Skeleton className='mb-1 h-6 w-3/4' />
                <Skeleton className='mb-3 h-4 w-1/3' />

                <Skeleton className='mb-2 h-4 w-full' />
                <Skeleton className='mb-2 h-4 w-full' />
                <Skeleton className='mb-4 h-4 w-2/3' />

                <div className='mb-4 flex items-center gap-4'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-20' />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-6 w-6 rounded-full' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-4 w-16' />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
