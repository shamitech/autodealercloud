'use client'

import { useState, useEffect } from 'react'
import { User, userService } from '@/lib/user-service'

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await userService.deleteUser(id)
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading users...</div>
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-100 p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Name</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Email</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Role</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Tenant</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Created</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4 text-gray-400">{user.email}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-900 text-purple-100' :
                  user.role === 'manager' ? 'bg-blue-900 text-blue-100' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-400 text-sm">
                {user.tenantId ? user.tenantId.substring(0, 8) : 'Platform'}
              </td>
              <td className="py-3 px-4 text-gray-400 text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No users found. Create your first user to get started.
        </div>
      )}
    </div>
  )
}
