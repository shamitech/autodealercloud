import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-2 px-4">
          <Link
            href="/dashboard"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/tenants"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Tenants
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-gray-700 p-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b border-gray-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {session.username || 'Admin'}!
          </h1>
          <p className="text-sm text-gray-600">
            You&apos;re logged in as: {session.username}
          </p>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
