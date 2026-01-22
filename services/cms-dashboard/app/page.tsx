'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    if (!token) {
      router.push('/login');
    } else {
      router.push('/pages');
    }
  }, [router]);

  return null;
}
