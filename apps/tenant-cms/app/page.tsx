export default function TenantCMS() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex h-16 items-center px-8">
          <h1 className="text-2xl font-bold">Tenant CMS & Web Builder</h1>
        </div>
      </header>

      <div className="flex flex-1 gap-8 p-8">
        {/* File Tree Navigation */}
        <aside className="w-64 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">Site Structure</h3>
          <div className="space-y-2">
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Pages</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Templates</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Components</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Content</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">⚙️ Settings</div>
          </div>
        </aside>

        {/* Main Canvas */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to Your CMS</h2>
            <p className="text-gray-600 mb-8">
              Build your auto dealer website using our visual builder. Create pages, customize components, and manage content all in one place.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                ➕ Create New Page
              </button>
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                📋 Browse Templates
              </button>
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                🎨 Build Components
              </button>
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                🚀 Publish Site
              </button>
            </div>
          </div>

          {/* Content Sidebar Placeholder */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-bold mb-4">Content Editor</h3>
            <p className="text-gray-600">
              Click on any component to edit its content here. Fill in text, upload images, and customize every element of your site.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
