'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { publisherApi } from '@/lib/api-client';
import Link from 'next/link';

interface PageContent {
  sections: Array<{
    type: string;
    componentId: string;
    [key: string]: any;
  }>;
}

export default function PublishedPage() {
  const params = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const tenantSlug = params.tenant as string;
        const pageSlug = params.page as string;
        
        if (!tenantSlug || !pageSlug) {
          setError('Invalid URL parameters');
          return;
        }

        const response = await publisherApi.get(`/pages/tenant/${tenantSlug}/${pageSlug}`);
        setPage(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          notFound();
        }
        setError(err.response?.data?.error || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This page does not exist.'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const content: PageContent = page.content || { sections: [] };

  return (
    <>
      <head>
        <title>{page.title}</title>
        <meta name="description" content={page.description || ''} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description || ''} />
      </head>
      
      <div className="min-h-screen bg-white">
        <nav className="bg-gray-900 text-white py-4 shadow">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold hover:text-gray-300">
              Dealership Site
            </Link>
            <div className="space-x-6">
              <Link href="/" className="hover:text-gray-300">Home</Link>
              <a href="#contact" className="hover:text-gray-300">Contact</a>
            </div>
          </div>
        </nav>

        <main>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
              {page.description && (
                <p className="text-xl text-blue-100">{page.description}</p>
              )}
            </div>
          </div>

          {/* Page Content Sections */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            {content.sections && content.sections.length > 0 ? (
              <div className="space-y-8">
                {content.sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 p-8 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Section {idx + 1}: {section.type}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Component ID: {section.componentId}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-12 rounded-lg text-center">
                <p className="text-gray-600">This page has no content yet.</p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div id="contact" className="bg-gray-900 text-white py-12 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-300 mb-8">
                Have questions? We'd love to hear from you.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold">
                Contact Us
              </button>
            </div>
          </div>
        </main>

        <footer className="bg-gray-950 text-gray-400 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>© {new Date().getFullYear()} Dealership. All rights reserved.</p>
            <p className="mt-2">Powered by AutoDealerCloud</p>
          </div>
        </footer>
      </div>
    </>
  );
}
