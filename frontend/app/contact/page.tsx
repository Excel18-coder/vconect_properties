import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-6">Contact Us</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Have questions about a property or need help with your account? Our team is here to help.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Customer Support</h2>
                <p className="text-gray-600">support@vconnect.co.ke</p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Phone</h2>
                <p className="text-gray-600">+254 700 000 000</p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Office</h2>
                <p className="text-gray-600">Nairobi, Kenya</p>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
              <h2 className="text-2xl font-semibold mb-4">Reach Out</h2>
              <p className="text-gray-600 leading-relaxed">
                Send us a message and we will get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
