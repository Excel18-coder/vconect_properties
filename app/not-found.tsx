import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-[#D32F2F] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
