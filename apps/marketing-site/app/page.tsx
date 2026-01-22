export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">AutoDealerCloud</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Features</button>
              <button className="text-gray-600 hover:text-gray-900">Pricing</button>
              <button className="text-gray-600 hover:text-gray-900">About</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Websites for Auto Dealerships
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create stunning, fully-featured dealership websites without coding. Manage inventory, showcase vehicles, and convert visitors into customers.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AutoDealerCloud?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Easy to Use</h4>
              <p className="text-gray-600">
                Intuitive visual builder. No technical knowledge required.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Mobile Responsive</h4>
              <p className="text-gray-600">
                Perfect on all devices. Your customers browse on phones.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Built for Dealers</h4>
              <p className="text-gray-600">
                Inventory management, lead capture, and analytics built-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Transform Your Online Presence?</h3>
          <p className="text-xl mb-8">
            Join hundreds of dealerships already using AutoDealerCloud
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 text-lg font-bold">
            Schedule a Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2026 AutoDealerCloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
