import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './components/LoginForm';

export default async function Home() {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mb-8 text-center text-sm text-gray-600">
            Auto Dealer Cloud Management
          </p>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
