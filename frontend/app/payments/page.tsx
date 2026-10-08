'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CreditCard, ShieldCheck, Star, Building2, UserRound, PhoneCall, Zap } from 'lucide-react';
import type { PaymentPlan, PaymentRecord, SubscriptionRole } from '@/lib/types';

const sellerPlans: PaymentPlan[] = [
  {
    id: 'pro',
    name: 'Professional',
    role: 'seller',
    description: 'Best for independent agents who want more listings and lead tools.',
    monthly: 500,
    yearly: 500,
    features: ['Up to 50 property listings', 'Featured placement', 'Advanced analytics', 'Priority support', 'Lead management tools', 'Virtual tour support'],
    popular: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    role: 'seller',
    description: 'Built for teams and agencies managing multiple agents and properties.',
    monthly: 500,
    yearly: 500,
    features: ['Unlimited listings', 'Premium placement', 'Advanced analytics & reports', 'Dedicated account manager', 'API access', 'Team collaboration', 'White-label options'],
  },
];

const buyerPlans: PaymentPlan[] = [
  {
    id: 'plus',
    name: 'Buyer Plus',
    role: 'buyer',
    description: 'For serious buyers who want better alerts and faster agent responses.',
    monthly: 500,
    yearly: 500,
    features: ['Priority inquiry handling', 'Saved search alerts', 'Early access to new listings', 'Direct contact shortcuts', 'Property comparison tools'],
  },
  {
    id: 'premium',
    name: 'Buyer Premium',
    role: 'buyer',
    description: 'For active buyers who want the most responsive experience on the platform.',
    monthly: 500,
    yearly: 500,
    features: ['Everything in Buyer Plus', 'Featured buyer support', 'Priority viewing requests', 'Advanced shortlist management', 'Market insights'],
    popular: true,
  },
];

function formatAmount(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

function PlanCard({
  plan,
  onCheckout,
  disabled,
  loading,
}: {
  plan: PaymentPlan;
  onCheckout: (plan: PaymentPlan) => void;
  disabled: boolean;
  loading: boolean;
}) {
  const amount = plan.monthly;

  return (
    <div className={`relative bg-white rounded-2xl border p-8 transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-[#D32F2F] shadow-lg' : 'border-gray-100'}`}>
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D32F2F] text-white">
          Most Popular
        </Badge>
      )}
      <div className="text-center mb-6">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${plan.popular ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-gray-600'}`}>
          {plan.role === 'seller' ? <Building2 className="h-7 w-7" /> : <UserRound className="h-7 w-7" />}
        </div>
        <h3 className="text-xl font-bold text-[#1A1A1A]">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
        <div className="mt-3">
          <span className="text-4xl font-bold text-[#1A1A1A]">{formatAmount(amount)}</span>
          <span className="text-gray-500">/month</span>
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
        className={`w-full h-12 ${plan.popular ? 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        disabled={disabled || loading}
        onClick={() => onCheckout(plan)}
      >
        {loading ? 'Opening PayHero...' : `Pay ${formatAmount(amount)}`}
      </Button>
    </div>
  );
}

export default function PaymentsPage() {
  const { profile, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<SubscriptionRole>('seller');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!profile?.role) return;
    setSelectedRole(profile.role === 'buyer' ? 'buyer' : 'seller');
    setPhone(profile.phone || '');
  }, [profile?.role, profile?.phone]);

  useEffect(() => {
    const loadPayments = async () => {
      if (!profile) return;
      setLoadingPayments(true);
      try {
        const response: any = await api.get('/payments/me');
        setPayments(Array.isArray(response.data) ? response.data : []);
      } catch {
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPayments();
  }, [profile]);

  useEffect(() => {
    if (!pendingPaymentId) return;

    let stopped = false;
    const interval = window.setInterval(async () => {
      try {
        const response: any = await api.get(`/payments/status/${pendingPaymentId}`);
        const payment = response?.data?.payment;
        if (!payment || stopped) return;

        setPayments((current) => {
          const next = current.filter((item) => item._id !== payment._id);
          return [payment, ...next];
        });

        if (payment.status === 'paid') {
          toast.success('Payment confirmed by PayHero');
          await refreshProfile();
          setPendingPaymentId(null);
          window.clearInterval(interval);
        }
      } catch {
        // Keep polling until timeout or success
      }
    }, 5000);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (!stopped) {
        toast.message('We are still waiting for PayHero confirmation. You can refresh this page shortly.');
      }
      setPendingPaymentId(null);
    }, 120000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [pendingPaymentId, refreshProfile]);

  const handleCheckout = async (plan: PaymentPlan) => {
    if (!profile) {
      toast.error('Please sign in first');
      return;
    }

    if (profile.role !== plan.role) {
      toast.error(`This plan is for ${plan.role} accounts`);
      return;
    }

    setActivePlanId(plan.id);
    try {
      const response: any = await api.post('/payments/initiate', {
        role: plan.role,
        planId: plan.id,
        billingCycle: 'monthly',
        phone,
      });

      const checkoutUrl = response?.data?.checkoutUrl;
      const paymentId = response?.data?.paymentId;
      if (paymentId) {
        setPendingPaymentId(paymentId);
      }

      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        toast.message('Complete the payment in the opened PayHero window, then return here.');
        return;
      }

      toast.success('Payment created. We are checking PayHero for confirmation.');
    } catch (error: any) {
      toast.error(error?.message || 'Unable to start PayHero checkout');
    } finally {
      setActivePlanId(null);
    }
  };

  const currentPlans = selectedRole === 'seller' ? sellerPlans : buyerPlans;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm mb-4">
              <ShieldCheck className="h-4 w-4 text-[#D32F2F]" />
              <span className="text-sm font-medium text-gray-700">Powered by PayHero</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Subscriptions & Payments</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seller plans unlock more listings and exposure. Buyer plans unlock faster support and better property access.
            </p>

            <div className="mt-6 max-w-md mx-auto text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa phone number for STK push</label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="07XXXXXXXX or +2547XXXXXXXX"
                  className="pl-10 bg-white"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">We’ll send the STK push to this number.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                className={selectedRole === 'seller' ? 'border-[#D32F2F] text-[#D32F2F] bg-white' : 'bg-white text-gray-600'}
                onClick={() => setSelectedRole('seller')}
              >
                Seller Plans
              </Button>
              <Button
                variant="outline"
                className={selectedRole === 'buyer' ? 'border-[#D32F2F] text-[#D32F2F] bg-white' : 'bg-white text-gray-600'}
                onClick={() => setSelectedRole('buyer')}
              >
                Buyer Plans
              </Button>
            </div>

            <div className="mt-6 text-sm text-gray-500">Flat price: KES 500 for both seller and buyer subscriptions.</div>
          </div>

          {!profile && (
            <Card className="mb-8 border-dashed border-2 bg-white/90">
              <CardContent className="p-6 text-center text-gray-600">
                Sign in to start a subscription checkout with PayHero.
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onCheckout={handleCheckout}
                disabled={!profile || profile.role !== plan.role || !phone.trim()}
                loading={activePlanId === plan.id}
              />
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border-gray-100">
              <CardHeader>
                <CardTitle>Your subscription status</CardTitle>
                <CardDescription>
                  {profile?.subscriptionStatus === 'active'
                    ? `Active ${profile.subscriptionRole} subscription`
                    : 'No active subscription found yet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p><span className="font-medium text-gray-900">Role:</span> {profile?.subscriptionRole || 'None'}</p>
                <p><span className="font-medium text-gray-900">Plan:</span> {profile?.subscriptionPlan || 'None'}</p>
                <p><span className="font-medium text-gray-900">Status:</span> {profile?.subscriptionStatus || 'inactive'}</p>
                <p><span className="font-medium text-gray-900">Provider:</span> {profile?.subscriptionProvider || 'PayHero'}</p>
                {pendingPaymentId && (
                  <p className="text-[#D32F2F] font-medium">Waiting for PayHero confirmation...</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100">
              <CardHeader>
                <CardTitle>Recent payments</CardTitle>
                <CardDescription>Last gateway requests and subscription attempts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingPayments ? (
                  <div className="text-sm text-gray-500">Loading payment history...</div>
                ) : payments.length > 0 ? (
                  payments.slice(0, 5).map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                      <div>
                        <p className="font-medium text-gray-900">{payment.planName}</p>
                        <p className="text-sm text-gray-500">{payment.role} • {payment.billingCycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatAmount(payment.amount)}</p>
                        <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>{payment.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No payments yet.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 bg-white rounded-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6 text-center">PayHero checkout benefits</h2>
            <div className="flex flex-wrap justify-center gap-8 items-center text-sm text-gray-600">
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-[#D32F2F]" />
                <span>M-Pesa and card support</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-[#D32F2F]" />
                <span>Webhook-based confirmation</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <Zap className="h-4 w-4 text-[#D32F2F]" />
                <span>Fast subscription activation</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
                <Star className="h-4 w-4 text-[#D32F2F]" />
                <span>Role-specific plans for buyers and sellers</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Active role: {profile?.role || 'guest'} • Available plan group: {selectedRole}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
