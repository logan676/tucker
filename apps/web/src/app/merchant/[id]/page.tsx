'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Star, Clock, Minus, Plus, ShoppingCart } from 'lucide-react'
import { api } from '@/services/api'

interface Product {
  id: string
  name: string
  description: string
  image: string
  price: number
  originalPrice?: number
  monthlySales: number
  isRecommend: boolean
}

interface ProductCategory {
  id: string
  name: string
  products: Product[]
}

interface Merchant {
  id: string
  name: string
  logo: string
  banner: string
  rating: number
  ratingCount: number
  monthlySales: number
  deliveryTime: string
  deliveryFee: number
  minOrderAmount: number
  description: string
}

interface CartItem {
  product: Product
  quantity: number
}

export default function MerchantPage() {
  const params = useParams()
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [menu, setMenu] = useState<{ categories: ProductCategory[] }>({ categories: [] })
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [merchantRes, menuRes] = await Promise.all([
          api.get(`/merchants/${params.id}`),
          api.get(`/merchants/${params.id}/products`),
        ])
        setMerchant(merchantRes.data)
        setMenu(menuRes.data)
        if (menuRes.data.categories?.[0]) {
          setActiveCategory(menuRes.data.categories[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch merchant:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prev.filter((item) => item.product.id !== productId)
    })
  }

  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Merchant not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="relative h-48">
        <Image
          src={merchant.banner || 'https://picsum.photos/800/400'}
          alt={merchant.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Merchant Info */}
      <div className="bg-white p-4 -mt-4 relative rounded-t-xl">
        <div className="flex gap-4">
          <div className="relative w-16 h-16 -mt-10">
            <Image
              src={merchant.logo || 'https://picsum.photos/200'}
              alt={merchant.name}
              fill
              className="object-cover rounded-lg border-2 border-white shadow"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{merchant.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="flex items-center text-primary-500">
                <Star size={14} className="mr-1" fill="currentColor" />
                {merchant.rating}
              </span>
              <span className="text-gray-400">({merchant.ratingCount} reviews)</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{merchant.monthlySales} sold/month</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                {merchant.deliveryTime}
              </span>
              <span>Delivery ¥{merchant.deliveryFee}</span>
              <span>Min ¥{merchant.minOrderAmount}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">{merchant.description}</p>
      </div>

      {/* Menu */}
      <div className="flex mt-2">
        {/* Categories sidebar */}
        <div className="w-24 bg-gray-100 overflow-y-auto">
          {menu.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full py-3 px-2 text-sm text-left ${
                activeCategory === category.id
                  ? 'bg-white text-primary-500 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 bg-white p-4">
          {menu.categories
            .filter((c) => c.id === activeCategory)
            .map((category) => (
              <div key={category.id}>
                {category.products.map((product) => (
                  <div key={product.id} className="flex gap-3 py-4 border-b border-gray-100">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={product.image || 'https://picsum.photos/200'}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                      {product.isRecommend && (
                        <span className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 rounded-tl-lg rounded-br-lg">
                          HOT
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-primary-500 font-medium">¥{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-gray-400 text-xs line-through">
                              ¥{product.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getCartQuantity(product.id) > 0 && (
                            <>
                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="w-6 h-6 bg-white border border-primary-500 text-primary-500 rounded-full flex items-center justify-center"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm w-4 text-center">
                                {getCartQuantity(product.id)}
                              </span>
                            </>
                          )}
                          <button
                            onClick={() => addToCart(product)}
                            className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span className="text-xl font-bold">¥{totalPrice.toFixed(2)}</span>
          </div>
          <button className="bg-primary-500 px-6 py-2 rounded-full font-medium">
            Checkout
          </button>
        </div>
      )}
    </div>
  )
}
