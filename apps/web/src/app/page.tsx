'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, ShoppingCart } from 'lucide-react'
import { api } from '@/services/api'

interface Category {
  id: string
  name: string
  icon: string
}

interface Merchant {
  id: string
  name: string
  logo: string
  rating: number
  monthlySales: number
  deliveryTime: string
  deliveryFee: number
  minOrderAmount: number
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, merchantsRes] = await Promise.all([
          api.get('/merchants/categories'),
          api.get('/merchants'),
        ])
        setCategories(categoriesRes.data)
        setMerchants(merchantsRes.data.items || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px]">
        <Image
          src="/images/hero-customer.jpeg"
          alt="Tucker - Aussie Eats, Delivered Fast"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="absolute bottom-8 left-4 right-4 md:left-8">
          {/* Search on Hero */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </section>

      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={20} className="text-primary-500" />
            <span className="text-sm font-medium">Select Delivery Address</span>
          </div>
          <Link href="/cart" className="relative">
            <ShoppingCart size={24} className="text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </header>

      {/* Categories */}
      <section className="p-4">
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        <div className="grid grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="mt-2 w-16 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.id}`}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <span className="mt-2 text-xs text-gray-600">{category.name}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Merchants */}
      <section className="p-4">
        <h2 className="text-lg font-semibold mb-3">Nearby Restaurants</h2>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))
          ) : merchants.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No restaurants available. Run seed data first.
            </div>
          ) : (
            merchants.map((merchant) => (
              <Link
                key={merchant.id}
                href={`/merchant/${merchant.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 p-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={merchant.logo || 'https://picsum.photos/200'}
                      alt={merchant.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{merchant.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className="text-primary-500">★ {merchant.rating}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">{merchant.monthlySales} sold/month</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{merchant.deliveryTime}</span>
                      <span>Delivery ¥{merchant.deliveryFee}</span>
                      <span>Min ¥{merchant.minOrderAmount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-primary-500">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center text-gray-500">
            <span className="text-xl">🔍</span>
            <span className="text-xs">Search</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center text-gray-500">
            <span className="text-xl">📋</span>
            <span className="text-xs">Orders</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-500">
            <span className="text-xl">👤</span>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
