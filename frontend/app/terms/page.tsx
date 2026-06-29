import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-6">Terms of Service</h1>
          <p className="text-gray-600 leading-relaxed mb-4">
            These terms govern your use of VConnect Properties. By using the site, you agree to the terms outlined here.
          </p>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Use of the Service</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to use the platform only for lawful property search, listing, and communication activities.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Account Responsibility</h2>
              <p className="text-gray-600 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Modifications</h2>
              <p className="text-gray-600 leading-relaxed">
                VConnect Properties may update these terms at any time. Continued use of the site after updates means you accept the new terms.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
