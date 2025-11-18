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
      const accessToken = loginData.access;

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

      // Set auth context and redirect
      setToken(accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Login successful', {
        description: `Welcome ${user.full_name}`
      });
      router.push('/dashboard/overview');
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
      </form>
    </Form>
  );
}
