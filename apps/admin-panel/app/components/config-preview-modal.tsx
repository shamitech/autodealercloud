'use client'

import { useState, useEffect } from 'react'
import { domainService } from '@/lib/domain-service'

interface ConfigPreviewModalProps {
  domainId: string
  onClose: () => void
  onDeploy: () => void
  isDeploying: boolean
}

export function ConfigPreviewModal({
  domainId,
  onClose,
  onDeploy,
  isDeploying,
}: ConfigPreviewModalProps) {
  const [config, setConfig] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [domainId])

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await domainService.previewCustomDomainConfig(domainId)
      setConfig(result.config)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold">Preview Nginx Configuration</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="text-gray-400 text-center py-8">Loading configuration...</div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 p-4 rounded mb-4">
              {error}
            </div>
          )}

          {config && (
            <div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">
                  This Nginx configuration will be deployed to your server. It will:
                </p>
                <ul className="text-gray-300 text-sm list-disc list-inside mb-4">
                  <li>Create a virtual host for your domain</li>
                  <li>Redirect HTTP to HTTPS</li>
                  <li>Configure SSL/TLS with Let's Encrypt certificate</li>
                  <li>Route traffic to your tenant publisher (port 3002)</li>
                </ul>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
                  {config}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isDeploying}
            className="px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onDeploy}
            disabled={isDeploying || loading || !!error}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded font-medium"
          >
            {isDeploying ? 'Deploying...' : 'Deploy Domain'}
          </button>
        </div>
      </div>
    </div>
  )
}
