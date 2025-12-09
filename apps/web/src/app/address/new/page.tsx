'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/services/api'

export default function NewAddressPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/checkout'

  const [form, setForm] = useState({
    label: '',
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.phone || !form.province || !form.city || !form.district || !form.detail) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.post('/users/me/addresses', form)
      router.push(redirect)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add address')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <button onClick={() => router.back()} className="mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Add Address</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm">
          {/* Label */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label (optional)
            </label>
            <div className="flex gap-2">
              {['Home', 'Office', 'School'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleChange('label', form.label === label ? '' : label)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    form.label === label
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Recipient name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="Phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => handleChange('province', e.target.value)}
                placeholder="Province"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="District"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Detail Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.detail}
              onChange={(e) => handleChange('detail', e.target.value)}
              placeholder="Street, building, room number, etc."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Default Toggle */}
          <label className="flex items-center mb-6">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-gray-700">Set as default address</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      </main>
    </div>
  )
}
