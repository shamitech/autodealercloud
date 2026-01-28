import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthUser() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  return { user, loading, logout };
}
