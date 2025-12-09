'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/services/api'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token')
    if (token) {
      router.push(redirect)
    }
  }, [redirect, router])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleSendCode = async () => {
    if (phone.length < 11) {
      setError('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.post('/auth/sms/send', { phone })
      setCodeSent(true)
      setCountdown(60)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (phone.length < 11 || code.length < 4) {
      setError('Please enter valid phone and verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/login/phone', { phone, code })
      localStorage.setItem('token', data.accessToken)
      router.push(redirect)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-orange-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🍔</span>
            </div>
            <h1 className="text-2xl font-bold">Tucker</h1>
            <p className="text-gray-500">Food delivery made easy</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Phone Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                  +86
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="Phone number"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={phone.length < 11 || countdown > 0 || isLoading}
                  className="px-4 py-3 bg-gray-100 text-orange-500 rounded-lg font-medium disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : codeSent ? 'Resend' : 'Send Code'}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={phone.length < 11 || code.length < 4 || !codeSent || isLoading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </main>
    </div>
  )
}
