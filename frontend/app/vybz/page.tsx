'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';
import api from '@/lib/api';
import type { VybzAuthor, VybzCategory, VybzPost, VybzPostType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Bookmark, Check, ChevronDown, Heart, MessageCircle, MoreHorizontal, Play, Plus,
  Search, Send, Sparkles, Upload, UserPlus, Volume2, VolumeX, X,
} from 'lucide-react';

const categories: { label: string; value: VybzCategory }[] = [
  { label: 'For You', value: 'all' },
  { label: 'Following', value: 'following' },
  { label: 'Explore', value: 'explore' },
  { label: 'Videos', value: 'videos' },
  { label: 'Memes', value: 'memes' },
  { label: 'Pictures', value: 'pictures' },
  { label: 'Stories', value: 'stories' },
  { label: 'Inspiration', value: 'inspiration' },
  { label: 'Art', value: 'art' },
];

const formatCount = (value: number) => value > 999 ? `${(value / 1000).toFixed(1)}k` : String(value);
const getAuthor = (post: VybzPost): VybzAuthor | null => typeof post.authorId === 'string' ? null : post.authorId;

function PostCard({ post, userId, onRefresh }: { post: VybzPost; userId: string; onRefresh: () => void }) {
  const author = getAuthor(post);
  const [liked, setLiked] = useState(post.likes.includes(userId));
  const [likes, setLikes] = useState(post.likes.length);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!videoRef.current) return;
      if (entry.isIntersecting) {
        videoRef.current.play().catch(() => undefined);
      } else {
        videoRef.current.pause();
      }
    }, { threshold: 0.65 });
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleLike = async () => {
    try {
      const response: any = await api.post(`/vybz/posts/${post._id}/like`);
      setLiked(response.liked);
      setLikes(response.likesCount);
    } catch {
      toast.error('Unable to update your like');
    }
  };

  const addComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/vybz/posts/${post._id}/comments`, { text: comment });
      setComment('');
      setShowComments(true);
      onRefresh();
    } catch {
      toast.error('Unable to add comment');
    }
  };

  const follow = async () => {
    if (!author) return;
    try {
      await api.post(`/vybz/follow/${author._id}`);
      toast.success(`Creator ${author.fullName} updated`);
    } catch {
      toast.error('Unable to update follow');
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D32F2F] font-semibold text-white">
            {author?.avatarUrl ? <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" /> : author?.fullName?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1A1A1A]">{author?.fullName || 'VYBZ creator'} {author?.verificationStatus === 'verified' && <Check className="inline h-4 w-4 text-blue-500" />}</p>
            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={follow} aria-label="Follow creator"><UserPlus className="h-4 w-4" /></Button>
      </div>

      <div className="relative bg-gray-950">
        {post.type === 'video' && post.mediaUrl ? (
          <>
            <video ref={videoRef} src={post.mediaUrl} className="max-h-[620px] w-full object-contain" loop playsInline muted={muted} controls />
            <Button variant="secondary" size="icon" className="absolute bottom-3 left-3 rounded-full bg-black/60 text-white hover:bg-black/80" onClick={() => setMuted(!muted)}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </>
        ) : post.type === 'image' && post.mediaUrl ? (
          <img src={post.mediaUrl} alt={post.caption || 'VYBZ post'} className="max-h-[620px] w-full object-contain" />
        ) : (
          <div className="flex min-h-[220px] items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#3d1c2a] to-[#D32F2F] p-8 text-center text-2xl font-bold text-white">{post.caption}</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className={liked ? 'text-[#D32F2F]' : ''} onClick={toggleLike} aria-label="Like post"><Heart className={liked ? 'fill-current' : ''} /></Button>
          <span className="mr-3 text-sm text-gray-600">{formatCount(likes)}</span>
          <Button variant="ghost" size="icon" onClick={() => setShowComments(!showComments)} aria-label="Show comments"><MessageCircle /></Button>
          <span className="text-sm text-gray-600">{post.comments.length}</span>
          <Button variant="ghost" size="icon" className="ml-auto" aria-label="Save post"><Bookmark /></Button>
          <Button variant="ghost" size="icon" aria-label="Share post"><Send /></Button>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{post.caption}</p>
        {post.hashtags.length > 0 && <p className="mt-2 text-sm font-medium text-[#D32F2F]">{post.hashtags.map((tag) => `#${tag}`).join(' ')}</p>}
        {showComments && (
          <div className="mt-4 border-t pt-3">
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {post.comments.map((item) => <p key={item._id} className="text-sm"><span className="font-semibold">{typeof item.userId === 'string' ? 'Member' : item.userId.fullName}</span> {item.text}</p>)}
            </div>
            <form onSubmit={addComment} className="mt-3 flex gap-2">
              <Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment..." maxLength={500} />
              <Button type="submit" size="icon" aria-label="Post comment"><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

export default function VybzPage() {
  const { user, isLoading } = useAuth();
  const [posts, setPosts] = useState<VybzPost[]>([]);
  const [active, setActive] = useState<VybzCategory>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({ caption: '', category: 'videos' as Exclude<VybzCategory, 'all' | 'following' | 'explore'>, type: 'video' as VybzPostType, hashtags: '' });

  const loadFeed = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (active === 'explore') {
        const response: any = await api.get('/vybz/explore');
        setPosts(response.data?.posts || []);
      } else {
        const response: any = await api.get('/vybz/feed', { params: { category: active, search: search || undefined, following: active === 'following' } });
        setPosts(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      toast.error('Unable to load VYBZ right now');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, [user, active]);

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.caption.trim() && !file && form.type === 'text') {
      toast.error('Add a caption before publishing');
      return;
    }
    setPublishing(true);
    try {
      let mediaUrl: string | undefined;
      let mediaPublicId: string | undefined;
      if (file) {
        const upload = new FormData();
        upload.append('media', file);
        const uploadResponse: any = await api.post('/upload', upload, { headers: { 'Content-Type': 'multipart/form-data' } });
        mediaUrl = uploadResponse.data?.url;
        mediaPublicId = uploadResponse.data?.publicId;
      }
      await api.post('/vybz/posts', {
        ...form,
        mediaUrl,
        mediaPublicId,
        hashtags: form.hashtags.split(/\s+/).filter(Boolean),
      });
      toast.success('Your VYBZ is live');
      setComposerOpen(false);
      setFile(null);
      setForm({ caption: '', category: 'videos', type: 'video', hashtags: '' });
      await loadFeed();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to publish your post');
    } finally {
      setPublishing(false);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (selected && selected.size > 100 * 1024 * 1024) {
      toast.error('Files must be 100MB or smaller');
      return;
    }
    setFile(selected);
    if (selected?.type.startsWith('image/')) setForm((current) => ({ ...current, type: 'image' }));
    if (selected?.type.startsWith('video/')) setForm((current) => ({ ...current, type: 'video' }));
  };

  if (isLoading) return <><Navbar /><main className="mx-auto max-w-3xl p-8 text-center text-gray-500">Loading VYBZ...</main></>;
  if (!user) return <><Navbar /><main className="flex min-h-[70vh] items-center justify-center bg-[#fff8f8] px-4"><div className="max-w-md text-center"><Sparkles className="mx-auto mb-4 h-12 w-12 text-[#D32F2F]" /><h1 className="text-4xl font-bold">Create. Share. Get Seen. Earn.</h1><p className="mt-3 text-gray-600">Sign in to discover creators and share your VYBZ with the VConnect community.</p><Link href="/auth/signin"><Button className="mt-6 bg-[#D32F2F] text-white">Sign in to VYBZ</Button></Link></div></main></>;

  return (
    <div className="min-h-screen bg-[#fffafa]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D32F2F]">VConnect social</p><h1 className="mt-1 text-4xl font-bold text-[#1A1A1A]">VYBZ</h1><p className="mt-1 text-gray-500">Create. Share. Get Seen. Earn.</p></div>
          <Button onClick={() => setComposerOpen(true)} className="bg-[#D32F2F] text-white hover:bg-[#B71C1C]"><Plus className="mr-2 h-4 w-4" /> Create VYBZ</Button>
        </div>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{categories.map((category) => <button key={category.label} onClick={() => setActive(category.value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${active === category.value ? 'bg-[#D32F2F] text-white' : 'bg-white text-gray-600 shadow-sm hover:text-[#D32F2F]'}`}>{category.label}</button>)}</div>
        <div className="mb-6 flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && loadFeed()} placeholder="Search creators, hashtags and posts" className="pl-9" /></div><Button variant="outline" onClick={loadFeed}>Search</Button></div>
        {loading ? <div className="py-16 text-center text-gray-500">Loading your feed...</div> : posts.length === 0 ? <div className="rounded-2xl border border-dashed bg-white py-16 text-center"><Sparkles className="mx-auto mb-3 h-8 w-8 text-[#D32F2F]" /><h2 className="text-xl font-semibold">Your VYBZ feed is ready</h2><p className="mt-1 text-gray-500">Be the first to create something worth seeing.</p><Button onClick={() => setComposerOpen(true)} className="mt-4 bg-[#D32F2F] text-white">Create your first post</Button></div> : <div className="mx-auto grid max-w-2xl gap-6">{posts.map((post) => <PostCard key={post._id} post={post} userId={user._id} onRefresh={loadFeed} />)}</div>}
      </main>
      {composerOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><form onSubmit={publish} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Create a VYBZ</h2><Button type="button" variant="ghost" size="icon" onClick={() => setComposerOpen(false)}><X /></Button></div><div className="space-y-4"><Textarea value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="What are you sharing?" maxLength={2000} /><Input value={form.hashtags} onChange={(event) => setForm({ ...form, hashtags: event.target.value })} placeholder="#travel #inspiration (optional)" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Exclude<VybzCategory, 'all' | 'following' | 'explore'> })} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"><option value="videos">Video</option><option value="pictures">Picture</option><option value="memes">Meme</option><option value="stories">Story</option><option value="inspiration">Inspiration</option><option value="art">Art</option><option value="text">Text post</option></select><label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 hover:border-[#D32F2F]"><Upload className="h-5 w-5" />{file ? file.name : 'Upload an image or video'}<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={onFileChange} className="hidden" /></label>{file && <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>}<Button type="submit" disabled={publishing} className="w-full bg-[#D32F2F] text-white">{publishing ? 'Publishing...' : 'Publish VYBZ'}</Button></div></form></div>}
    </div>
  );
}
