import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <section className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank you for your purchase!</h1>
          <p className="text-gray-600 mb-8">Your payment was successful. You can now access all premium features.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
              Go to Dashboard
            </Link>
            <Link href="/" className="text-gray-700 hover:text-gray-900">Return Home</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


