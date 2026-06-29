import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-6">Privacy Policy</h1>
          <p className="text-gray-600 leading-relaxed mb-4">
            We value your privacy. This policy explains how we collect, use, and protect your personal information when you use VConnect Properties.
          </p>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Information Collection</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect only the information necessary to provide our services, including account details and property inquiry data.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Use of Data</h2>
              <p className="text-gray-600 leading-relaxed">
                Your data is used to personalize your experience, manage transactions, and communicate important updates.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We use industry-standard safeguards to protect your information and will never share it with third parties without consent.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
