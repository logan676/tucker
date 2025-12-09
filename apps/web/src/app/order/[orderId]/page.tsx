'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/services/api'

const statusMap: Record<string, { label: string; color: string; step: number }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-yellow-600', step: 0 },
  pending_confirm: { label: 'Confirming', color: 'text-blue-600', step: 1 },
  confirmed: { label: 'Confirmed', color: 'text-blue-600', step: 2 },
  preparing: { label: 'Preparing', color: 'text-orange-600', step: 2 },
  delivering: { label: 'Delivering', color: 'text-purple-600', step: 3 },
  completed: { label: 'Completed', color: 'text-green-600', step: 4 },
  cancelled: { label: 'Cancelled', color: 'text-red-600', step: -1 },
  refunded: { label: 'Refunded', color: 'text-gray-600', step: -1 },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    loadOrder()
    // Poll for updates every 10 seconds
    const interval = setInterval(loadOrder, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  const loadOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`)
      setOrder(data)
    } catch (err) {
      console.error('Error loading order:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    setIsCancelling(true)
    try {
      await api.post(`/orders/${orderId}/cancel`, {
        reason: 'Customer requested cancellation',
      })
      loadOrder()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setIsCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link href="/" className="text-orange-500">
          Back to Home
        </Link>
      </div>
    )
  }

  const status = statusMap[order.status] || { label: order.status, color: 'text-gray-600', step: 0 }

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
          <h1 className="text-xl font-bold">Order Details</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24">
        {/* Status */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
              <p className="text-sm text-gray-500">Order: {order.orderNo}</p>
            </div>
            {order.status === 'pending_payment' && (
              <Link
                href={`/payment/${orderId}`}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Pay Now
              </Link>
            )}
          </div>

          {/* Progress Steps */}
          {status.step >= 0 && (
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
              {['Ordered', 'Confirmed', 'Preparing', 'Delivering', 'Completed'].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      index <= status.step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index < status.step ? '✓' : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-500">{step}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <h2 className="font-bold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Delivery Address
            </h2>
            <p className="font-medium">
              {order.deliveryAddress.name} {order.deliveryAddress.phone}
            </p>
            <p className="text-sm text-gray-500">
              {order.deliveryAddress.province} {order.deliveryAddress.city}{' '}
              {order.deliveryAddress.district} {order.deliveryAddress.detail}
            </p>
          </section>
        )}

        {/* Order Items */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-3">{order.merchant?.name}</h2>
          <div className="divide-y">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center py-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg mr-3"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-orange-500 text-sm">¥{item.price}</div>
                </div>
                <div className="text-gray-500">x{item.quantity}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Price Details */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-3">Payment Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>¥{Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span>¥{Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-¥{Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-bold">
              <span>Total Paid</span>
              <span className="text-orange-500">¥{Number(order.payAmount).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Order Info */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-3">Order Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number</span>
              <span className="font-mono">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order Time</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paid Time</span>
                <span>{formatDate(order.paidAt)}</span>
              </div>
            )}
            {order.remark && (
              <div className="flex justify-between">
                <span className="text-gray-500">Notes</span>
                <span>{order.remark}</span>
              </div>
            )}
          </div>
        </section>

        {/* Cancel Button */}
        {(order.status === 'pending_payment' || order.status === 'pending_confirm') && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </main>
    </div>
  )
}
