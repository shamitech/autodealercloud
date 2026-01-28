import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">AutoDealerCloud Publisher</h1>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Dealership Site</h2>
          <p className="text-xl text-gray-600">
            This is your beautiful, auto-generated dealership website powered by AutoDealerCloud
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-bold mb-2">🚗 Vehicles</h3>
            <p className="text-gray-600">Browse our complete vehicle inventory</p>
          </div>
          <div className="bg-white p-8 rounded shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-bold mb-2">📍 Locations</h3>
            <p className="text-gray-600">Find us near you with contact information</p>
          </div>
          <div className="bg-white p-8 rounded shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-bold mb-2">📞 Contact</h3>
            <p className="text-gray-600">Get in touch with our sales team</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-gray-600 mb-4">
            This is a dynamically generated landing page. Your dealership's custom pages will appear here once published from the CMS.
          </p>
          <p className="text-sm text-gray-500">
            Powered by AutoDealerCloud | Multi-tenant SaaS CMS for Auto Dealerships
          </p>
        </div>
      </main>
    </div>
  );
}
