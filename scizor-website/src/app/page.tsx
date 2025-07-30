import { Header, Hero, Features, HowItWorks, Download, Footer } from './components';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Download />
      </main>
      <Footer />
    </div>
  );
}
