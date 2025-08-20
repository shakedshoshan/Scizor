/* Server-side Lemon Squeezy API helpers */

type JsonApiResource<TAttrs = Record<string, unknown>> = {
  id: string;
  type: string;
  attributes: TAttrs;
  relationships?: Record<string, unknown>;
};

export type LemonProduct = JsonApiResource<{
  name: string;
  description?: string | null;
  price?: number;
  price_formatted?: string;
  buy_now_url?: string;
  status?: string;
  test_mode?: boolean;
  slug?: string;
}>;

export type LemonVariant = JsonApiResource<{
  name: string;
  status: string;
  product_id: number;
  price: number;
  is_subscription: boolean;
  interval: string | null;
  interval_count: number | null;
  trial_interval: string | null;
  trial_interval_count: number | null;
  has_free_trial?: boolean;
  test_mode?: boolean;
  buy_now_url?: string;
  slug?: string;
}>;

export type LemonPrice = JsonApiResource<{
  variant_id: number;
  amount: number;
  currency: string;
  recurring: boolean;
}>;

export type ProductWithVariants = {
  product: LemonProduct;
  variants: LemonVariant[];
  prices: Record<string, LemonPrice[]>;
};

const LEMONSQUEEZY_API_BASE = 'https://api.lemonsqueezy.com/v1';

function getApiHeaders() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error('Missing LEMONSQUEEZY_API_KEY');
  }
  
  // Make sure the API key is properly formatted with Bearer prefix
  const authToken = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
  
  return {
    Authorization: authToken,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  } as const;
}

export async function fetchProductsWithVariants(): Promise<ProductWithVariants[]> {
  console.log('Fetching products from Lemon Squeezy API...');

  const url = new URL(`${LEMONSQUEEZY_API_BASE}/products`);
  
  // Filter by store ID if available
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (storeId) {
    url.searchParams.set('filter[store_id]', storeId);
    console.log(`Filtering products by store ID: ${storeId}`);
  } else {
    console.log('No store ID provided, fetching all products');
  }
  
  url.searchParams.set('include', 'variants');
  url.searchParams.set('page[size]', '100');

  // Log the URL we're fetching (without the auth token)
  console.log('Fetching from URL:', url.toString());
  
  const headers = getApiHeaders();
  console.log('Using headers:', { 
    Accept: headers.Accept,
    'Content-Type': headers['Content-Type'],
    // Don't log the full auth token for security
    Authorization: 'Bearer sk_***' 
  });
  
  const res = await fetch(url.toString(), {
    headers,
    // Next.js fetch cache: always revalidate quickly for pricing
    next: { revalidate: 30 },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Lemon Squeezy API error:', res.status, errorText);
    
    // More detailed error information
    if (res.status === 401) {
      console.error('Authentication failed. Please check your API key.');
    } else if (res.status === 403) {
      console.error('Permission denied. Your API key may not have access to this resource.');
    } else if (res.status === 404) {
      console.error('Resource not found. The endpoint may be incorrect or the resource may not exist.');
    }
    
    throw new Error(`Failed to load Lemon Squeezy products: ${res.status} ${errorText.slice(0, 100)}`);
  }
  const json = await res.json();
  console.log('Lemon Squeezy API response:', JSON.stringify(json, null, 2).slice(0, 500) + '...');

  const products = (json.data as LemonProduct[]) || [];
  const included = (json.included as LemonVariant[]) || [];
  const variantsByProductId = new Map<number, LemonVariant[]>();
  const pricesByVariantId = new Map<number, LemonPrice[]>();

  // Process variants
  for (const inc of included) {
    if (inc.type === 'variants') {
      const productId = Number(inc.attributes?.product_id ?? (inc.relationships?.product as { data?: { id: string } })?.data?.id);
      if (!variantsByProductId.has(productId)) variantsByProductId.set(productId, []);
      variantsByProductId.get(productId)!.push(inc);
    }
  }

  const results: ProductWithVariants[] = products.map((product) => {
    const productId = Number(product.id);
    const variants = variantsByProductId.get(productId) || [];
    const prices: Record<string, LemonPrice[]> = {};
    
    // Associate prices with variants
    variants.forEach(variant => {
      const variantId = Number(variant.id);
      prices[variant.id] = pricesByVariantId.get(variantId) || [];
    });
    
    return { product, variants, prices };
  });

  console.log(`Found ${results.length} products with ${results.reduce((sum, p) => sum + p.variants.length, 0)} variants`);
  return results;
}

export function formatPrice(price: LemonPrice): string {
  const amount = price.attributes.amount / 100; // Convert cents to dollars
  const currency = price.attributes.currency.toUpperCase();
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function getVariantPriceLabel(variant: LemonVariant, prices: LemonPrice[]): string {
  // If we have prices, format them
  if (prices && prices.length > 0) {
    const price = prices[0]; // Use first price
    const formattedPrice = formatPrice(price);
    
    if (variant.attributes.is_subscription) {
      const interval = variant.attributes.interval;
      const count = variant.attributes.interval_count || 1;
      
      let period = '';
      if (interval === 'day') period = count === 1 ? 'daily' : `/${count} days`;
      else if (interval === 'week') period = count === 1 ? 'weekly' : `/${count} weeks`;
      else if (interval === 'month') period = count === 1 ? '/mo' : `/${count} months`;
      else if (interval === 'year') period = count === 1 ? '/yr' : `/${count} years`;
      
      return `${formattedPrice}${period}`;
    }
    
    return formattedPrice;
  }
  
  // Fallback: try to use the variant's price attribute if available
  if (variant.attributes.price) {
    const amount = variant.attributes.price / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Default to USD
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  }
  
  // Last resort fallback
  return 'See pricing';
}

export function buildCheckoutUrl(variantId: string, buyNowUrl?: string): string {
  // If a direct buy_now_url is provided, use it (adding query params)
  if (buyNowUrl) {
    const url = new URL(buyNowUrl);
    url.searchParams.set('embed', '1');
    url.searchParams.set('media', '0');
    return url.toString();
  }
  
  // Otherwise build the URL from store domain and variant ID
  const storeDomain = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_DOMAIN;
  if (!storeDomain) {
    throw new Error('Missing NEXT_PUBLIC_LEMONSQUEEZY_STORE_DOMAIN');
  }
  
  // Hosted checkout URL that Lemon.js can enhance to overlay
  return `https://${storeDomain}.lemonsqueezy.com/checkout/buy/${variantId}`;
}


