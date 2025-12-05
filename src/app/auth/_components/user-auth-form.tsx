// 'use client';
//
// import * as React from 'react';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import * as z from 'zod';
//
// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { toast } from 'sonner';
//
// const formSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters')
// });
//
// interface UserAuthFormProps {
//   type: 'sign-in' | 'sign-up';
// }
//
// export function UserAuthForm({ type }: UserAuthFormProps) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: '',
//       password: ''
//     }
//   });
//
//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     setIsLoading(true);
//
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
//       router.push('/dashboard');
//       toast.success('Success', {
//         description:
//           type === 'sign-in' ? 'Welcome back!' : 'Account created successfully!'
//       });
//     } catch (error) {
//       toast.error('Error', {
//         description: 'Authentication failed. Please check your credentials.'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }
//
//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
//         <FormField
//           control={form.control}
//           name='email'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Email</FormLabel>
//               <FormControl>
//                 <Input
//                   type='email'
//                   placeholder='name@example.com'
//                   {...field}
//                   disabled={isLoading}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name='password'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Password</FormLabel>
//               <FormControl>
//                 <Input
//                   type='password'
//                   placeholder='Enter your password'
//                   {...field}
//                   disabled={isLoading}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type='submit' className='w-full' disabled={isLoading}>
//           {isLoading ? (
//             <div className='flex items-center gap-2'>
//               <span className='loading loading-spinner'></span>
//               {type === 'sign-in' ? 'Signing in...' : 'Creating account...'}
//             </div>
//           ) : type === 'sign-in' ? (
//             'Sign in'
//           ) : (
//             'Create account'
//           )}
//         </Button>
//       </form>
//     </Form>
//   );
// }

'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export function UserAuthForm() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Call the login API
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/token/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        }
      );

      if (!loginRes.ok) throw new Error('Invalid credentials');

      const loginData = await loginRes.json();
      console.log('[Login] API Response:', loginData); // 調試日誌
      
      const accessToken = loginData.access;
      const refreshToken = loginData.refresh;
      
      console.log('[Login] Access Token:', accessToken ? 'received' : 'missing');
      console.log('[Login] Refresh Token:', refreshToken ? 'received' : 'missing');
      
      // 直接存儲 refresh token 到 localStorage（確保存儲）
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
        console.log('[Login] Refresh token saved to localStorage');
      }

      // Fetch user info using the access token
      const userInfoRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!userInfoRes.ok) throw new Error('Failed to fetch user info');

      const json = await userInfoRes.json();
      const user = json?.data ?? json;

      // Set auth context and redirect (包含 refresh token)
      setToken(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Login successful', {
        description: `Welcome ${user.full_name}`
      });
      router.replace('/dashboard/overview');
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Invalid email or password.'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='name@example.com'
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Enter your password'
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
        
        <div className='relative my-4'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
          </div>
        </div>
        
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={() => {
            // Redirect to Google OAuth
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            const redirectUri = `${window.location.origin}/auth/google/callback`;
            const scope = 'email profile';
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
            window.location.href = googleAuthUrl;
          }}
        >
          <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
            <path
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              fill='#4285F4'
            />
            <path
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              fill='#34A853'
            />
            <path
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              fill='#FBBC05'
            />
            <path
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              fill='#EA4335'
            />
          </svg>
          Continue with Google
        </Button>
      </form>
    </Form>
  );
}
