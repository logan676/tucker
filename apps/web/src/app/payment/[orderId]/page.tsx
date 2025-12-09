'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/services/api'

type PaymentMethod = 'wechat' | 'alipay' | 'card'

interface PaymentInfo {
  paymentId: string
  orderId: string
  amount: number
  method: PaymentMethod
  paymentUrl: string
  expireAt: string
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wechat')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(900) // 15 minutes

  useEffect(() => {
    loadOrderInfo()
  }, [orderId])

  useEffect(() => {
    if (countdown <= 0) {
      setError('Payment expired. Please create a new order.')
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  useEffect(() => {
    if (!paymentInfo) return

    // Poll payment status every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const { data } = await api.get(`/payments/${paymentInfo.paymentId}/status`)
        if (data.status === 'success') {
          clearInterval(pollInterval)
          router.push(`/order/${orderId}/success`)
        } else if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(pollInterval)
          setError('Payment failed or expired. Please try again.')
        }
      } catch (err) {
        console.error('Error polling payment status:', err)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [paymentInfo, orderId, router])

  const loadOrderInfo = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`)
      setOrderInfo(data)

      // Calculate remaining time
      if (data.createdAt) {
        const createdAt = new Date(data.createdAt).getTime()
        const expireAt = createdAt + 15 * 60 * 1000
        const remaining = Math.max(0, Math.floor((expireAt - Date.now()) / 1000))
        setCountdown(remaining)
      }
    } catch (err: any) {
      console.error('Error loading order:', err)
      setError(err.response?.data?.message || 'Failed to load order')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePay = async () => {
    setIsProcessing(true)
    setError('')

    try {
      const { data } = await api.post('/payments', {
        orderId,
        method: selectedMethod,
      })
      setPaymentInfo(data)
    } catch (err: any) {
      console.error('Error creating payment:', err)
      setError(err.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMockPayment = async () => {
    if (!paymentInfo) return

    setIsProcessing(true)
    try {
      await api.get(`/payments/${paymentInfo.paymentId}/mock-pay?success=true`)
      router.push(`/order/${orderId}/success`)
    } catch (err: any) {
      console.error('Error processing mock payment:', err)
      setError(err.response?.data?.message || 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-center">Payment</h1>
          <p className="text-center text-sm mt-1 opacity-90">
            Time remaining: {formatTime(countdown)}
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Order Amount */}
        <section className="bg-white rounded-lg p-6 mb-4 shadow-sm text-center">
          <p className="text-gray-500 mb-2">Amount to Pay</p>
          <p className="text-4xl font-bold text-orange-500">
            ¥{orderInfo?.payAmount?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-2">Order: {orderInfo?.orderNo}</p>
        </section>

        {!paymentInfo ? (
          <>
            {/* Payment Methods */}
            <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <h2 className="font-bold mb-4">Select Payment Method</h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    selectedMethod === 'wechat' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value="wechat"
                    checked={selectedMethod === 'wechat'}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xl">W</span>
                  </div>
                  <span className="font-medium">WeChat Pay</span>
                  {selectedMethod === 'wechat' && (
                    <svg className="w-5 h-5 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>

                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    selectedMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value="alipay"
                    checked={selectedMethod === 'alipay'}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xl">A</span>
                  </div>
                  <span className="font-medium">Alipay</span>
                  {selectedMethod === 'alipay' && (
                    <svg className="w-5 h-5 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>

                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    selectedMethod === 'card' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={selectedMethod === 'card'}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xl">C</span>
                  </div>
                  <span className="font-medium">Credit/Debit Card</span>
                  {selectedMethod === 'card' && (
                    <svg className="w-5 h-5 text-purple-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              </div>
            </section>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing || countdown <= 0}
              className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay ¥${orderInfo?.payAmount?.toFixed(2)}`}
            </button>
          </>
        ) : (
          <>
            {/* Mock Payment UI */}
            <section className="bg-white rounded-lg p-6 mb-4 shadow-sm text-center">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Scan QR Code</p>
                  <p className="text-xs text-gray-300 mt-1">(Mock Payment)</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                In production, this would show a {selectedMethod === 'wechat' ? 'WeChat' : selectedMethod === 'alipay' ? 'Alipay' : 'Card'} payment QR code
              </p>
            </section>

            {/* Mock Pay Button */}
            <button
              onClick={handleMockPayment}
              disabled={isProcessing}
              className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Simulate Successful Payment'}
            </button>

            <button
              onClick={() => setPaymentInfo(null)}
              className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
            >
              Change Payment Method
            </button>
          </>
        )}
      </main>
    </div>
  )
}
