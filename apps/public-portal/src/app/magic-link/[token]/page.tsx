'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth/service';
import { useAuthStore } from '@/store/auth/slice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MagicLinkPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { user, token } = await AuthService.verifyMagicLink(params.token);
        setAuth(user, token);
        router.push('/profile');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid or expired link');
      }
    };

    verifyToken();
  }, [params.token, router, setAuth]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-red-50 text-red-500 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
      <p className="ml-2">Verifying your link...</p>
    </div>
  );
} 