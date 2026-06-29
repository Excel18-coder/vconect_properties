import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-6">About Us</h1>
          <p className="text-gray-600 leading-relaxed mb-4">
            VConnect Properties is a premium real estate marketplace dedicated to connecting buyers, sellers, and agents across Kenya.
            Our platform makes it easy to discover verified properties, manage inquiries, and close transactions with confidence.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            We believe in transparency, trusted service, and the power of local expertise. Our team is committed to delivering a seamless property experience for every client.
          </p>
          <div className="grid gap-6 md:grid-cols-2 mt-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To make property discovery and transactions easier for everyone by offering the best listings, vetted sellers, and effective communication tools.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">What We Do</h2>
              <p className="text-gray-600 leading-relaxed">
                We help buyers find homes and investments, support sellers in listing properties, and keep communities informed with the latest market trends.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
