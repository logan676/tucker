'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/services/api'

interface Address {
  id: string
  label?: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

interface CartItem {
  product: {
    id: string
    name: string
    price: number
    image?: string
    merchantId: string
  }
  quantity: number
}

interface Merchant {
  id: string
  name: string
  deliveryFee: number
  minOrderAmount: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [remark, setRemark] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load cart from localStorage
      const savedCart = localStorage.getItem('cart')
      const savedMerchant = localStorage.getItem('cartMerchant')

      if (!savedCart || !savedMerchant) {
        router.push('/')
        return
      }

      const cart = JSON.parse(savedCart) as CartItem[]
      const merchantData = JSON.parse(savedMerchant) as Merchant

      if (cart.length === 0) {
        router.push('/')
        return
      }

      setCartItems(cart)
      setMerchant(merchantData)

      // Load addresses
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login?redirect=/checkout')
        return
      }

      const { data: addressData } = await api.get('/users/me/addresses')
      setAddresses(addressData)

      // Select default address
      const defaultAddress = addressData.find((a: Address) => a.isDefault)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      } else if (addressData.length > 0) {
        setSelectedAddressId(addressData[0].id)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load checkout data')
    } finally {
      setIsLoading(false)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const deliveryFee = merchant?.deliveryFee || 0
  const total = subtotal + deliveryFee

  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address')
      return
    }

    if (!merchant) {
      setError('Merchant information is missing')
      return
    }

    if (subtotal < (merchant.minOrderAmount || 0)) {
      setError(`Minimum order amount is ¥${merchant.minOrderAmount}`)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Create order
      const { data: orderData } = await api.post('/orders', {
        merchantId: merchant.id,
        addressId: selectedAddressId,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        remark: remark || undefined,
      })

      // Clear cart
      localStorage.removeItem('cart')
      localStorage.removeItem('cartMerchant')

      // Redirect to payment page
      router.push(`/payment/${orderData.orderId}`)
    } catch (err: any) {
      console.error('Error creating order:', err)
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
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
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <button onClick={() => router.back()} className="mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-32">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Delivery Address */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Delivery Address
          </h2>

          {addresses.length === 0 ? (
            <Link
              href="/address/new?redirect=/checkout"
              className="block text-center py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500"
            >
              + Add delivery address
            </Link>
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`block p-3 border rounded-lg cursor-pointer ${
                    selectedAddressId === address.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {address.name}
                        <span className="text-gray-500 ml-2">{address.phone}</span>
                        {address.label && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {address.label}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {address.province} {address.city} {address.district} {address.detail}
                      </div>
                    </div>
                    {selectedAddressId === address.id && (
                      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </label>
              ))}
              <Link
                href="/address/new?redirect=/checkout"
                className="block text-center py-2 text-orange-500 hover:underline"
              >
                + Add new address
              </Link>
            </div>
          )}
        </section>

        {/* Order Items */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {merchant?.name}
          </h2>

          <div className="divide-y">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center py-3">
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg mr-3"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-orange-500">¥{item.product.price}</div>
                </div>
                <div className="text-gray-500">x{item.quantity}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Remark */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-3">Order Notes</h2>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add any special instructions..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-orange-500"
            rows={2}
          />
        </section>

        {/* Price Summary */}
        <section className="bg-white rounded-lg p-4 shadow-sm">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>¥{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span>¥{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-500">¥{total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-gray-500">Total: </span>
            <span className="text-xl font-bold text-orange-500">¥{total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !selectedAddressId || cartItems.length === 0}
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
