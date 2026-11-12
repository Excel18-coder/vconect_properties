'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/api';

type Wallet = {
  pendingCoins: number;
  availableCoins: number;
  reservedCoins: number;
  redeemedCoins: number;
  lifetimeEarnedCoins: number;
  lifetimeViewCoins: number;
  lifetimeLikeCoins: number;
  lifetimeBonusCoins: number;
};

type RewardConfig = {
  minimumWithdrawalCoins: number;
  maximumWithdrawalCoins?: number;
  coinsPerKes: number;
  withdrawalFeeKes: number;
};

export default function VybzWalletPage() {
  const { user, isLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [config, setConfig] = useState<RewardConfig | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [coins, setCoins] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [walletResponse, withdrawalResponse]: any[] = await Promise.all([
        api.get('/vybz/wallet'),
        api.get('/vybz/withdrawals'),
      ]);
      setWallet(walletResponse.data.wallet);
      setConfig(walletResponse.data.config);
      setWithdrawals(withdrawalResponse.data || []);
      setTransactions(walletResponse.data.transactions || []);
      setPhone(user?.phone || '');
    } catch {
      toast.error('Unable to load your VYBZ wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void load();
  }, [user]);

  const submitWithdrawal = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/vybz/withdrawals', { coins: Number(coins), phone });
      toast.success('Withdrawal request submitted for review');
      setCoins('');
      await load();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to submit withdrawal');
    }
  };

  if (isLoading || loading) return <><Navbar /><main className="p-8 text-center text-gray-500">Loading wallet...</main></>;
  if (!user) return <><Navbar /><main className="p-8 text-center">Sign in to view your VYBZ wallet.</main></>;
  if (!wallet || !config) return <><Navbar /><main className="p-8 text-center">Wallet unavailable.</main></>;

  const kesValue = Math.floor(wallet.availableCoins / config.coinsPerKes);
  return (
    <div className="min-h-screen bg-[#fffafa]">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">VYBZ Wallet</h1><p className="text-gray-500">100 VBC = KSh 1</p></div>
          <Link href="/vybz"><Button variant="outline">Back to VYBZ</Button></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ['Available', wallet.availableCoins],
            ['Pending', wallet.pendingCoins],
            ['Reserved', wallet.reservedCoins],
            ['Lifetime earned', wallet.lifetimeEarnedCoins],
          ].map(([label, value]) => <div key={label} className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold">{value.toLocaleString()} VBC</p></div>)}
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-gray-500">Available KES equivalent</p><p className="text-3xl font-bold">KSh {kesValue.toLocaleString()}</p></div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Earnings and transaction history</h2>
        {transactions.length === 0 ? <p className="text-sm text-gray-500">Your reward transactions will appear here after qualified engagement is processed.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr><th className="px-2 py-3">Date</th><th className="px-2 py-3">Description</th><th className="px-2 py-3">Type</th><th className="px-2 py-3">Coins</th><th className="px-2 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="whitespace-nowrap px-2 py-3 text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td className="px-2 py-3">{transaction.description}</td>
                    <td className="px-2 py-3 capitalize">{transaction.type.replaceAll('_', ' ')}</td>
                    <td className={`px-2 py-3 font-semibold ${transaction.type === 'withdrawal' || transaction.type === 'reversal' ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.type === 'withdrawal' || transaction.type === 'reversal' ? '-' : '+'}{transaction.coins.toLocaleString()} VBC
                    </td>
                    <td className="px-2 py-3 capitalize text-gray-600">{transaction.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitWithdrawal} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Request withdrawal</h2>
            <p className="text-sm text-gray-500">Minimum: {config.minimumWithdrawalCoins.toLocaleString()} VBC (KSh {Math.floor(config.minimumWithdrawalCoins / config.coinsPerKes)}). Coins remain reserved until review.</p>
            <Input type="number" min={config.minimumWithdrawalCoins} max={config.maximumWithdrawalCoins} value={coins} onChange={(event) => setCoins(event.target.value)} placeholder="VBC amount" required />
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="M-PESA number" required />
            {coins && <p className="text-sm">Gross: KSh {Math.floor(Number(coins) / config.coinsPerKes).toLocaleString()} | Fee: KSh {config.withdrawalFeeKes.toLocaleString()}</p>}
            <Button type="submit" className="w-full bg-[#D32F2F] text-white">Submit withdrawal</Button>
          </form>
          <div className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-semibold">Withdrawal history</h2><div className="space-y-3">{withdrawals.length === 0 ? <p className="text-gray-500">No withdrawal requests yet.</p> : withdrawals.map((item) => <div key={item._id} className="flex justify-between border-b pb-2 text-sm"><span>{item.reference}<br /><span className="text-gray-500">{item.coins.toLocaleString()} VBC</span></span><span className="capitalize">{item.status}</span></div>)}</div></div>
        </div>
      </main>
    </div>
  );
}
