'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function VybzAnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (!user) return;
    api.get('/vybz/analytics').then((response: any) => setData(response.data)).catch(() => toast.error('Unable to load analytics'));
  }, [user]);
  if (isLoading) return <><Navbar /><main className="p-8 text-center">Loading analytics...</main></>;
  if (!user) return <><Navbar /><main className="p-8 text-center">Sign in to view analytics.</main></>;
  const views = data?.engagement?.filter((item: any) => item._id.type === 'view').reduce((sum: number, item: any) => sum + item.count, 0) || 0;
  const likes = data?.engagement?.filter((item: any) => item._id.type === 'like').reduce((sum: number, item: any) => sum + item.count, 0) || 0;
  return <div className="min-h-screen bg-[#fffafa]"><Navbar /><main className="mx-auto max-w-5xl space-y-6 px-4 py-8"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">VYBZ Analytics</h1><p className="text-gray-500">Qualified engagement and earnings for the last 30 days.</p></div><div className="flex gap-2"><Link href="/vybz/wallet"><Button variant="outline">Wallet</Button></Link><Link href="/vybz"><Button variant="outline">VYBZ</Button></Link></div></div><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Qualified views</p><p className="text-3xl font-bold">{views.toLocaleString()}</p></div><div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Eligible likes</p><p className="text-3xl font-bold">{likes.toLocaleString()}</p></div><div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Rewards issued</p><p className="text-3xl font-bold">{(data?.earnings || []).reduce((sum: number, item: any) => sum + item.coins, 0).toLocaleString()} VBC</p></div></div><div className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-semibold">Best-performing content</h2>{data?.bestPosts?.length ? data.bestPosts.map((post: any) => <div key={post._id} className="flex justify-between border-b py-3 text-sm"><span className="truncate pr-4">{post.caption || 'Untitled post'}</span><span>{post.engagements} engagements</span></div>) : <p className="text-gray-500">No qualified engagement in this period.</p>}</div></main></div>;
}
