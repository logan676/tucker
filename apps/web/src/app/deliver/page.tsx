'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, DollarSign, MapPin, CheckCircle } from 'lucide-react'

export default function DeliverPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen max-h-[800px]">
        <Image
          src="/images/hero-deliver.jpeg"
          alt="Deliver Tucker. Get Paid."
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why deliver with Tucker?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Hours</h3>
              <p className="text-gray-600">
                Work when you want. Set your own schedule and be your own boss.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keep 100% Tips</h3>
              <p className="text-gray-600">
                Every tip you earn goes straight to you. Great rates plus bonuses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Deliveries</h3>
              <p className="text-gray-600">
                Deliver in your neighbourhood. Short trips, more earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            What you need to start
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Be at least 18 years old',
              'Have a valid Australian driver\'s license or photo ID',
              'Own a car, scooter, or bicycle',
              'Have a smartphone (iPhone or Android)',
              'Pass a background check',
              'Have the right to work in Australia',
            ].map((requirement, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{requirement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start earning?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of drivers delivering across Australia
          </p>
          <Link
            href="/deliver/signup"
            className="inline-block bg-white text-primary-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            Sign Up to Deliver
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold text-primary-400">
            Tucker
          </Link>
          <p className="text-gray-400 mt-2">
            Aussie Eats, Delivered.
          </p>
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/help" className="hover:text-white">Help</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
