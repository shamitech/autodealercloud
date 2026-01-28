'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuthUser() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('cms_token');
    router.push('/login');
  };

  return { user, loading, logout };
}
