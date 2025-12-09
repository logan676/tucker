'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/services/api'

const statusMap: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' },
  pending_confirm: { label: 'Confirming', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  delivering: { label: 'Delivering', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/orders')
      return
    }
    loadOrders()
  }, [router])

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders')
      setOrders(data.items || [])
    } catch (err) {
      console.error('Error loading orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return ['pending_payment', 'pending_confirm'].includes(order.status)
    if (activeTab === 'active') return ['confirmed', 'preparing', 'delivering'].includes(order.status)
    if (activeTab === 'completed') return order.status === 'completed'
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <button onClick={() => router.push('/')} className="mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">My Orders</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-14 z-10">
        <div className="max-w-2xl mx-auto flex">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'active', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab.key
                  ? 'text-orange-500 border-orange-500'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-500">No orders yet</p>
            <Link
              href="/"
              className="inline-block mt-4 text-orange-500 hover:underline"
            >
              Start ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' }
              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="block bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">{order.merchant?.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="p-4">
                    <div className="flex items-center">
                      {order.items?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg mr-2"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg mr-2 flex items-center justify-center text-gray-400 text-xs">
                              {item.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <span className="text-gray-400 text-sm ml-1">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)} · {order.items?.length} items
                      </span>
                      <span className="font-medium text-orange-500">
                        ¥{Number(order.payAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'pending_payment' && (
                    <div className="px-4 pb-4">
                      <Link
                        href={`/payment/${order.id}`}
                        className="block w-full text-center bg-orange-500 text-white py-2 rounded-lg text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pay Now
                      </Link>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
