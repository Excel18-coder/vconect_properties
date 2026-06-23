'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Building2 } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    icon: Star,
    features: [
      'Up to 5 property listings',
      'Basic analytics',
      'Standard search placement',
      'Email support',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2999,
    period: 'month',
    icon: Zap,
    features: [
      'Up to 50 property listings',
      'Featured placement',
      'Advanced analytics',
      'Priority support',
      'Lead management tools',
      'Virtual tour support',
    ],
    cta: 'Upgrade Now',
    popular: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 9999,
    period: 'month',
    icon: Building2,
    features: [
      'Unlimited listings',
      'Premium placement',
      'Advanced analytics & reports',
      'Dedicated account manager',
      'API access',
      'Team collaboration',
      'White-label options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PaymentsPage() {
  const { profile } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Subscription Plans</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Choose the perfect plan for your real estate business. Upgrade anytime to unlock more features.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-white text-gray-600 hover:text-[#D32F2F]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-white text-gray-600 hover:text-[#D32F2F]'
                }`}
              >
                Yearly <span className="text-green-500 text-xs">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border p-8 transition-all duration-300 hover:shadow-lg ${
                  plan.popular ? 'border-[#D32F2F] shadow-lg' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D32F2F] text-white">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    plan.popular ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <plan.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">{plan.name}</h3>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-[#1A1A1A]">
                      KES {billingCycle === 'yearly' ? Math.round(plan.price * 0.8 * 12).toLocaleString() : plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500">/{billingCycle === 'yearly' ? 'year' : plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full h-12 ${
                    plan.popular
                      ? 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="mt-16 bg-white rounded-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6 text-center">Accepted Payment Methods</h2>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded bg-green-600 text-white flex items-center justify-center text-xs font-bold">M</div>
                <span className="font-medium text-sm">M-Pesa</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">S</div>
                <span className="font-medium text-sm">Stripe</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded bg-blue-800 text-white flex items-center justify-center text-xs font-bold">P</div>
                <span className="font-medium text-sm">PayPal</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded bg-orange-500 text-white flex items-center justify-center text-xs font-bold">V</div>
                <span className="font-medium text-sm">Visa</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center text-xs font-bold">MC</div>
                <span className="font-medium text-sm">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
