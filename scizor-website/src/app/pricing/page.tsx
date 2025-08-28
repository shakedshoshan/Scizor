import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { fetchProductsWithVariants } from '@/utils/lemonsqueezy';
import LemonEventsClient from './LemonEventsClient';
import PricingContent from './PricingContent';

export default async function PricingPage() {
  let products: any[] = [];
  let error = null;
  
  try {
    products = await fetchProductsWithVariants();
    console.log(`Rendering pricing page with ${products.length} products`);
    
    // Debug log for product data
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}/${products.length}:`, {
        id: product.product.id,
        name: product.product.attributes.name,
        variants: product.variants.length,
        buy_now_url: product.product.attributes.buy_now_url || 'Not available'
      });
      
      // Log variant details
      product.variants.forEach((variant: any, vIndex: number) => {
        console.log(`  - Variant ${vIndex + 1}/${product.variants.length}:`, {
          id: variant.id,
          name: variant.attributes.name,
          status: variant.attributes.status,
          buy_now_url: variant.attributes.buy_now_url || 'Not available'
        });
      });
    });
  } catch (e) {
    console.error('Error fetching products:', e);
    error = e instanceof Error ? e.message : 'Unknown error fetching products';
  }



  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <LemonEventsClient />
        <PricingContent products={products} error={error} />
      </main>
      <Footer />
    </div>
  );
}


