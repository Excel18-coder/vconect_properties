'use client';

import { useEffect, useState, useRef } from 'react';
import { Building2, Users, Handshake, Eye } from 'lucide-react';

const stats = [
  { icon: Building2, value: 10500, suffix: '+', label: 'Properties Listed' },
  { icon: Users, value: 500, suffix: '+', label: 'Verified Agents' },
  { icon: Handshake, value: 8500, suffix: '+', label: 'Successful Deals' },
  { icon: Eye, value: 2.5, suffix: 'M+', label: 'Monthly Views', isDecimal: true },
];

function AnimatedCounter({ value, suffix, isDecimal, inView }: { value: number; suffix: string; isDecimal?: boolean; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else { setCount(current); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);
  const display = isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString();
  return <span>{display}{suffix}</span>;
}

export function Statistics() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-7 w-7 text-[#D32F2F]" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} isDecimal={stat.isDecimal} inView={inView} />
              </p>
              <p className="text-gray-600 mt-1 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
