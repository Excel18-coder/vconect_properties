'use client';

import { ChangeEvent, FormEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
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
  Bookmark, Check, Heart, MessageCircle, Plus, Search, Send, Share2, Sparkles,
  Upload, UserPlus, Volume2, VolumeX, X,
} from 'lucide-react';

const categories: { label: string; value: VybzCategory }[] = [
  { label: 'For You', value: 'all' },
  { label: 'Following', value: 'following' },
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
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qualifiedViewRecorded = useRef(false);

  useEffect(() => {
    void api.post(`/vybz/posts/${post._id}/view`).catch(() => undefined);
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
  }, [post._id]);

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

  const recordQualifiedView = async () => {
    if (qualifiedViewRecorded.current || !videoRef.current) return;
    qualifiedViewRecorded.current = true;
    try {
      await api.post(`/vybz/posts/${post._id}/view`, { watchSeconds: videoRef.current.currentTime });
    } catch {
      qualifiedViewRecorded.current = false;
    }
  };

  const follow = async () => {
    if (!author) return;
    try {
      const response: any = await api.post(`/vybz/follow/${author._id}`);
      setFollowing(Boolean(response.following));
      toast.success(response.following ? `Following ${author.fullName}` : `Unfollowed ${author.fullName}`);
    } catch {
      toast.error('Unable to update follow');
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/vybz?post=${post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VYBZ', text: post.caption || 'Check out this VYBZ', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('VYBZ link copied');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') toast.error('Unable to share this VYBZ');
    }
  };

  const toggleSaved = async () => {
    try {
      const response: any = await api.post(`/vybz/posts/${post._id}/bookmark`);
      setSaved(Boolean(response.saved));
      toast.success(response.saved ? 'VYBZ saved' : 'Removed from saved VYBZ');
    } catch {
      toast.error('Unable to update saved VYBZ');
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
        <Button variant="ghost" size="icon" onClick={follow} aria-label={following ? 'Unfollow creator' : 'Follow creator'}><UserPlus className={`h-4 w-4 ${following ? 'text-[#D32F2F]' : ''}`} /></Button>
      </div>

      <div className="relative bg-gray-950">
        {post.type === 'video' && post.mediaUrl ? (
          <>
            <video ref={videoRef} src={post.mediaUrl} onTimeUpdate={() => { if (videoRef.current && videoRef.current.currentTime >= 5) void recordQualifiedView(); }} className="max-h-[620px] w-full object-contain" loop playsInline muted={muted} controls />
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
          <Button variant="ghost" size="icon" className={`ml-auto ${saved ? 'text-[#D32F2F]' : ''}`} aria-label={saved ? 'Remove saved post' : 'Save post'} onClick={toggleSaved}><Bookmark className={saved ? 'fill-current' : ''} /></Button>
          <Button variant="ghost" size="icon" aria-label="Share post" onClick={share}><Share2 /></Button>
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
  const [active, setActive] = useState<VybzCategory>('all');
  const [search, setSearch] = useState('');
  const [feedCache, setFeedCache] = useState<Record<VybzCategory, VybzPost[]>>({} as Record<VybzCategory, VybzPost[]>);
  const [loadingCategories, setLoadingCategories] = useState<Record<VybzCategory, boolean>>({} as Record<VybzCategory, boolean>);
  const [composerOpen, setComposerOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({ caption: '', category: 'videos' as Exclude<VybzCategory, 'all' | 'following' | 'explore'>, type: 'video' as VybzPostType, hashtags: '' });
  const [dragOffset, setDragOffset] = useState(0);
  const [activePostIndexes, setActivePostIndexes] = useState<Record<VybzCategory, number>>({} as Record<VybzCategory, number>);
  const categoryPanelRefs = useRef<Map<VybzCategory, HTMLDivElement>>(new Map());
  const postRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollPositions = useRef<Record<VybzCategory, number>>({} as Record<VybzCategory, number>);
  const requestVersions = useRef<Record<VybzCategory, number>>({} as Record<VybzCategory, number>);
  const pointerGesture = useRef<{ id: number; x: number; y: number; axis: 'x' | 'y' | null }>({ id: -1, x: 0, y: 0, axis: null });
  const categoryNavigationLock = useRef(0);
  const postNavigationLock = useRef(0);
  const wheelGesture = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  const loadFeed = async (category: VybzCategory = active, query = search, replace = false) => {
    if (!user) return;
    const version = (requestVersions.current[category] || 0) + 1;
    requestVersions.current[category] = version;
    setLoadingCategories((current) => ({ ...current, [category]: true }));
    try {
      const response: any = await api.get('/vybz/feed', { params: { category, search: query || undefined, following: category === 'following', limit: 50 } });
      const incoming = Array.isArray(response.data) ? response.data : [];
      if (requestVersions.current[category] !== version) return;
      setFeedCache((current) => {
        if (replace) return { ...current, [category]: incoming };
        const existing = current[category] || [];
        const unique = new Map<string, VybzPost>();
        [...existing, ...incoming].forEach((post) => {
          if (post?._id) unique.set(post._id, post);
        });
        return { ...current, [category]: Array.from(unique.values()) };
      });
    } catch {
      if (requestVersions.current[category] !== version) return;
      toast.error('Unable to load VYBZ right now');
    } finally {
      if (requestVersions.current[category] === version) {
        setLoadingCategories((current) => ({ ...current, [category]: false }));
      }
    }
  };

  useEffect(() => { if (user) void loadFeed(active); }, [user, active]);

  useEffect(() => {
    const panel = categoryPanelRefs.current.get(active);
    if (!panel) return;
    const frame = window.requestAnimationFrame(() => {
      panel.scrollTop = scrollPositions.current[active] || 0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  const activeIndex = Math.max(0, categories.findIndex((category) => category.value === active));

  const isInteractiveGestureTarget = (target: EventTarget | null) => {
    return target instanceof Element && Boolean(target.closest(
      'button, a, input, textarea, select, option, label, video, audio, [role="button"], [contenteditable="true"], [data-vybz-gesture-ignore]'
    ));
  };

  const saveActiveScrollPosition = () => {
    const panel = categoryPanelRefs.current.get(active);
    if (panel) scrollPositions.current[active] = panel.scrollTop;
  };

  const navigateCategory = (direction: -1 | 1) => {
    const now = Date.now();
    if (now - categoryNavigationLock.current < 280) return;
    const targetIndex = activeIndex + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    categoryNavigationLock.current = now;
    saveActiveScrollPosition();
    const target = categories[targetIndex].value;
    setDragOffset(0);
    setActive(target);
  };

  const navigatePost = (direction: -1 | 1) => {
    const now = Date.now();
    if (now - postNavigationLock.current < 220) return;
    const posts = feedCache[active] || [];
    if (posts.length === 0) return;
    const currentIndex = activePostIndexes[active] || 0;
    const targetIndex = Math.min(posts.length - 1, Math.max(0, currentIndex + direction));
    if (targetIndex === currentIndex) return;
    postNavigationLock.current = now;
    setActivePostIndexes((current) => ({ ...current, [active]: targetIndex }));
    window.requestAnimationFrame(() => {
      const post = posts[targetIndex];
      const element = post ? postRefs.current.get(`${active}:${post._id}`) : null;
      const panel = categoryPanelRefs.current.get(active);
      if (!element || !panel) return;
      const elementRect = element.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      panel.scrollTo({
        top: panel.scrollTop + elementRect.top - panelRect.top - 12,
        behavior: 'smooth',
      });
    });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isInteractiveGestureTarget(event.target)) return;
    pointerGesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerGesture.current.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerGesture.current.x;
    const deltaY = event.clientY - pointerGesture.current.y;
    if (pointerGesture.current.axis === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.25) pointerGesture.current.axis = 'x';
      else if (Math.abs(deltaY) > Math.abs(deltaX) * 1.25) pointerGesture.current.axis = 'y';
    }
    if (pointerGesture.current.axis === 'x') {
      event.preventDefault();
      setDragOffset(deltaX);
    }
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerGesture.current.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerGesture.current.x;
    const deltaY = event.clientY - pointerGesture.current.y;
    const axis = pointerGesture.current.axis;
    pointerGesture.current = { id: -1, x: 0, y: 0, axis: null };
    setDragOffset(0);
    if (axis === 'x' && Math.abs(deltaX) >= 52) {
      navigateCategory(deltaX < 0 ? 1 : -1);
    } else if (axis === 'y' && Math.abs(deltaY) >= 52) {
      navigatePost(deltaY < 0 ? 1 : -1);
    }
  };

  useEffect(() => {
    const viewport = document.querySelector('[data-vybz-category-viewport]') as HTMLDivElement | null;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => {
      if (isInteractiveGestureTarget(event.target)) return;
      event.preventDefault();
      const now = Date.now();
      if (now - wheelGesture.current.time > 180) {
        wheelGesture.current = { x: 0, y: 0, time: now };
      }
      wheelGesture.current.x += event.deltaX;
      wheelGesture.current.y += event.deltaY;
      wheelGesture.current.time = now;
      const horizontal = Math.abs(wheelGesture.current.x) > Math.abs(wheelGesture.current.y) * 1.15;
      if (horizontal && Math.abs(wheelGesture.current.x) >= 48) {
        navigateCategory(wheelGesture.current.x > 0 ? 1 : -1);
        wheelGesture.current.x = 0;
        wheelGesture.current.y = 0;
      } else if (!horizontal && Math.abs(wheelGesture.current.y) >= 54) {
        navigatePost(wheelGesture.current.y > 0 ? 1 : -1);
        wheelGesture.current.x = 0;
        wheelGesture.current.y = 0;
      }
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  });

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.caption.trim() && !file && form.type === 'text') {
      toast.error('Add a caption before publishing');
      return;
    }
    if (form.type !== 'text' && !file) {
      toast.error('Add an image or video before publishing');
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
        type: form.category === 'text' ? 'text' : form.type,
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

  const onCategoryChange = (category: Exclude<VybzCategory, 'all' | 'following' | 'explore'>) => {
    const type = category === 'text' ? 'text' : category === 'videos' ? 'video' : 'image';
    setForm((current) => ({
      ...current,
      category,
      type,
    }));
    if (category === 'text') setFile(null);
  };

  if (isLoading) return <><Navbar /><main className="mx-auto max-w-3xl p-8 text-center text-gray-500">Loading VYBZ...</main></>;
  if (!user) return <><Navbar /><main className="flex min-h-[70vh] items-center justify-center bg-[#fff8f8] px-4"><div className="max-w-md text-center"><Sparkles className="mx-auto mb-4 h-12 w-12 text-[#D32F2F]" /><h1 className="text-4xl font-bold">Create. Share. Get Seen. Earn.</h1><p className="mt-3 text-gray-600">Sign in to discover creators and share your VYBZ with the VConnect community.</p><Link href="/auth/signin"><Button className="mt-6 bg-[#D32F2F] text-white">Sign in to VYBZ</Button></Link></div></main></>;

  return (
    <div className="min-h-screen bg-[#fffafa]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D32F2F]">VConnect social</p><h1 className="mt-1 text-4xl font-bold text-[#1A1A1A]">VYBZ</h1><p className="mt-1 font-semibold text-[#D32F2F]">Express your mind.</p><p className="text-sm text-gray-500">Create. Share. Get Seen. Earn.</p></div>
          <div className="flex gap-2"><Link href="/vybz/analytics"><Button variant="outline">Analytics</Button></Link><Link href="/vybz/wallet"><Button variant="outline">Wallet</Button></Link><Button onClick={() => setComposerOpen(true)} className="bg-[#D32F2F] text-white hover:bg-[#B71C1C]"><Plus className="mr-2 h-4 w-4" /> Create VYBZ</Button></div>
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => {
                if (category.value === active) return;
                saveActiveScrollPosition();
                setDragOffset(0);
                setActive(category.value);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === category.value ? 'bg-[#D32F2F] text-white' : 'bg-white text-gray-600 shadow-sm hover:text-[#D32F2F]'}`}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void loadFeed(active, event.currentTarget.value, true)} placeholder="Search creators, hashtags and posts" className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => void loadFeed(active, search, true)}>Search</Button>
        </div>
        <div
          data-vybz-category-viewport
          className="relative h-[calc(100vh-265px)] min-h-[520px] overflow-hidden rounded-2xl"
          style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <div
            className="flex h-full w-full transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
              transitionDuration: dragOffset === 0 ? '300ms' : '0ms',
            }}
          >
            {categories.map((category) => {
              const categoryPosts = feedCache[category.value] || [];
              const categoryLoading = loadingCategories[category.value];
              return (
                <div
                  key={category.value}
                  ref={(element) => {
                    if (element) categoryPanelRefs.current.set(category.value, element);
                    else categoryPanelRefs.current.delete(category.value);
                  }}
                  className="h-full w-full shrink-0 overflow-y-auto overscroll-contain px-1 py-2"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {categoryLoading && categoryPosts.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">Loading {category.label}...</div>
                  ) : categoryPosts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed bg-white py-16 text-center">
                      <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#D32F2F]" />
                      <h2 className="text-xl font-semibold">{category.label} is ready</h2>
                      <p className="mt-1 text-gray-500">Be the first to create something worth seeing.</p>
                      <Button onClick={() => setComposerOpen(true)} className="mt-4 bg-[#D32F2F] text-white">Create a VYBZ</Button>
                    </div>
                  ) : (
                    <div className="mx-auto grid max-w-2xl gap-6">
                      {categoryPosts.map((post) => (
                        <div
                          key={post._id}
                          ref={(element) => {
                            const refKey = `${category.value}:${post._id}`;
                            if (element) postRefs.current.set(refKey, element);
                            else postRefs.current.delete(refKey);
                          }}
                        >
                          <PostCard post={post} userId={user._id} onRefresh={() => void loadFeed(category.value)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      {composerOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><form onSubmit={publish} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Create a VYBZ</h2><Button type="button" variant="ghost" size="icon" onClick={() => setComposerOpen(false)}><X /></Button></div><div className="space-y-4"><Textarea value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="What are you sharing?" maxLength={2000} /><Input value={form.hashtags} onChange={(event) => setForm({ ...form, hashtags: event.target.value })} placeholder="#travel #inspiration (optional)" /><select value={form.category} onChange={(event) => onCategoryChange(event.target.value as Exclude<VybzCategory, 'all' | 'following' | 'explore'>)} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"><option value="videos">Video</option><option value="pictures">Picture</option><option value="memes">Meme</option><option value="stories">Story</option><option value="inspiration">Inspiration</option><option value="art">Art</option><option value="text">Text post</option></select>{form.category !== 'text' && <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 hover:border-[#D32F2F]"><Upload className="h-5 w-5" />{file ? file.name : 'Upload an image or video'}<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={onFileChange} className="hidden" /></label>}{file && <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>}<Button type="submit" disabled={publishing} className="w-full bg-[#D32F2F] text-white">{publishing ? 'Publishing...' : 'Publish VYBZ'}</Button></div></form></div>}
    </div>
  );
}
