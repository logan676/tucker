'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/services/api'

export default function OrderSuccessPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`)
      setOrder(data)
    } catch (err) {
      console.error('Error loading order:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-2xl mx-auto p-4 pt-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-500">Your order is being prepared</p>
        </div>

        {/* Order Info */}
        {order && (
          <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-mono text-lg font-bold">{order.orderNo}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Restaurant</span>
                <span>{order.merchant?.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Items</span>
                <span>{order.items?.length} items</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Paid</span>
                <span className="text-orange-500 font-bold">¥{order.payAmount?.toFixed(2)}</span>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-500 mb-1">Delivery To</p>
                <p className="text-sm">
                  {order.deliveryAddress.name} {order.deliveryAddress.phone}
                </p>
                <p className="text-sm text-gray-500">
                  {order.deliveryAddress.province} {order.deliveryAddress.city}{' '}
                  {order.deliveryAddress.district} {order.deliveryAddress.detail}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Estimated Time */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm text-center">
          <p className="text-gray-500">Estimated Delivery Time</p>
          <p className="text-2xl font-bold text-orange-500">30-45 min</p>
        </section>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/order/${orderId}`}
            className="block w-full bg-orange-500 text-white py-3 rounded-lg font-medium text-center"
          >
            Track Order
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium text-center"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
