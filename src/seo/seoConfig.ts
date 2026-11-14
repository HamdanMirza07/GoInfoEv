import type { EVModel } from '../data/evModels';

export type SeoTabKey =
  | 'home'
  | 'charging-stations'
  | 'products'
  | 'comparison'
  | 'range'
  | 'charging'
  | 'battery'
  | 'savings'
  | 'solar'
  | 'rider'
  | 'blogs'
  | 'content'
  | 'about'
  | 'contact'
  | 'admin'
  | 'user-dashboard';

export interface SeoBlogInput {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
}

export interface SeoPayload {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  robots: string;
  ogType: 'website' | 'article' | 'product';
  jsonLd: Record<string, unknown>[];
}

export interface ResolvedSeo extends SeoPayload {
  canonicalUrl: string;
  ogImageUrl: string;
  siteName: string;
}

export const SITE_NAME = 'goinfoEV';
export const DEFAULT_OG_IMAGE_PATH = '/og-image.jpg';

export function clampTitle(raw: string, suffix = ' | goinfoEV'): string {
  const clean = raw.replace(/\s+/g, ' ').trim();
  const full = clean.includes('goinfoEV') ? clean : `${clean}${suffix}`;
  if (full.length <= 60) return full;
  const maxBase = Math.max(20, 60 - suffix.length - 1);
  return `${clean.slice(0, maxBase).trim()}…${suffix}`;
}

export function clampDescription(raw: string, fallbackTail = ' Explore specs and free EV tools on goinfoEV.'): string {
  let clean = raw.replace(/\s+/g, ' ').trim();
  if (clean.length < 120) {
    clean = `${clean}${fallbackTail}`.replace(/\s+/g, ' ').trim();
  }
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157).trimEnd()}...`;
}

export const HOME_FAQS = [
  {
    q: 'How much does it cost to charge an electric bike per 100 km in Pakistan and globally?',
    a: 'A typical 2.2 kWh electric bike or scooter uses about 2.4 to 2.6 kWh from the wall for 80 to 100 km of real-world riding. In Pakistan (at Rs 35–55/unit), a full charge costs Rs 85–145; globally (at $0.15/kWh), it costs roughly $0.38 per 100 km—around 75% to 85% cheaper than petrol.',
  },
  {
    q: 'Which EV battery chemistry is best for hot climates: LFP, NMC, or Graphene?',
    a: 'Lithium Iron Phosphate (LiFePO4 / LFP) is the top choice for 40°C–48°C summer climates in Pakistan, the Middle East, and South Asia, delivering 2,500–4,000 cycles (6–9 years) with superior thermal stability compared to Graphene (800–1,200 cycles) and NMC (1,200–1,800 cycles).',
  },
  {
    q: 'How much monthly money can delivery riders save by switching from a 70cc petrol bike to an EV?',
    a: 'Riding 1,500 to 2,500 km per month on a 70cc or 125cc petrol motorcycle typically costs Rs 10,500 to Rs 18,000 in fuel plus Rs 1,500–2,500 in engine oil and tuning. Switching to an electric two-wheeler cuts monthly energy costs by 75%+, often paying back the vehicle price in 12 to 20 months.',
  },
  {
    q: 'Can I charge an electric scooter or EV motorcycle directly from home solar panels?',
    a: 'Yes. A 1 kW to 3 kW solar PV setup with a pure sine wave inverter easily covers daily 2–3 kWh electric bike charging, enabling near-zero running cost via daytime solar charging or net-metering.',
  },
];

export function buildFaqJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function buildBaseSchemas(origin: string): Record<string, unknown>[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'goinfoEV – EV Calculators & Fleet Analytics',
      url: origin,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      inLanguage: ['en', 'ur'],
      description:
        'Compare 150+ electric bikes & scooters, estimate real-world EV range, charging costs, petrol fuel savings, solar sizing, and battery health.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'goinfoEV',
      url: origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/products?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'goinfoEV',
      url: origin,
      logo: `${origin}${DEFAULT_OG_IMAGE_PATH}`,
      email: 'Hamdan7394@gmail.com',
      areaServed: ['PK', 'Global'],
    },
  ];
}

export const STATIC_ROUTE_SEO: Record<SeoTabKey, Omit<SeoPayload, 'jsonLd'> & { appCategory?: string }> = {
  home: {
    title: 'goinfoEV – EV Calculators, Range & Fleet Guide',
    description:
      'Compare 150+ EV bikes & scooters in Pakistan and worldwide. Calculate EV vs petrol savings, charging costs, range & solar sizing free.',
    keywords:
      'goinfoEV, electric bike price in Pakistan, EV vs petrol savings calculator, EV charging cost calculator, EV range estimator, solar EV charging, LFP electric scooter',
    canonicalPath: '/',
    robots: 'index, follow',
    ogType: 'website',
  },
  products: {
    title: 'EV Bikes & Scooters Catalog | Specs – goinfoEV',
    description:
      'Browse 150+ electric bikes and scooters with verified prices, LFP & graphene battery specs, real-world range, and motor power on goinfoEV.',
    keywords:
      'Pakistan EV bikes catalog, Crown electric scooter price, Vlektra price, MS Jaguar EV, Yadea Pakistan, Revoo electric bike, Jolta EV, OKLA electric scooter',
    canonicalPath: '/products',
    robots: 'index, follow',
    ogType: 'website',
  },
  comparison: {
    title: 'Compare Electric Bikes Side-by-Side | goinfoEV',
    description:
      'Compare electric scooters and EV motorcycles side-by-side by price, battery kWh, range, motor wattage, and monthly petrol fuel savings.',
    keywords:
      'compare electric bikes, EV scooter comparison tool, Crown vs Yadea, Vlektra vs MS Jaguar, electric motorcycle spec comparison',
    canonicalPath: '/comparison',
    robots: 'index, follow',
    ogType: 'website',
  },
  range: {
    title: 'EV Range Estimator – Real-World Distance | goinfoEV',
    description:
      'Estimate real-world electric bike and scooter range by speed, rider weight, terrain, and temperature for Pakistan and global EV riders.',
    keywords:
      'EV range calculator, electric scooter range estimator, real world EV mileage calculator, battery Wh to km calculator',
    canonicalPath: '/range',
    robots: 'index, follow',
    ogType: 'website',
    appCategory: 'UtilitiesApplication',
  },
  charging: {
    title: 'EV Charging Cost Calculator – kWh & Tariffs | goinfoEV',
    description:
      'Calculate electric vehicle charging cost per kWh, full charge price, and monthly bill across WAPDA, K-Electric, and global electricity tariffs.',
    keywords:
      'EV charging cost calculator, WAPDA EV charging bill, K-Electric slab EV cost, kWh to charging cost calculator, electric scooter electricity cost',
    canonicalPath: '/charging',
    robots: 'index, follow',
    ogType: 'website',
    appCategory: 'FinanceApplication',
  },
  battery: {
    title: 'EV Battery Health & SOH Tracker | LFP & NMC | goinfoEV',
    description:
      'Track EV battery State of Health (SOH), cycle life, and thermal degradation for LFP, NMC, and graphene batteries to maximize battery lifespan.',
    keywords:
      'EV battery health tracker, battery SOH calculator, LFP vs graphene battery life, EV battery degradation estimator',
    canonicalPath: '/battery',
    robots: 'index, follow',
    ogType: 'website',
    appCategory: 'UtilitiesApplication',
  },
  savings: {
    title: 'EV vs Petrol & Gas Savings Calculator | goinfoEV',
    description:
      'Calculate monthly and yearly EV vs petrol savings, ROI payback period, and CO2 reduction for daily commuters and fleets worldwide.',
    keywords:
      'EV vs petrol calculator, electric vs gas bike savings, EV ROI payback calculator, petrol savings electric scooter Pakistan global',
    canonicalPath: '/savings',
    robots: 'index, follow',
    ogType: 'website',
    appCategory: 'FinanceApplication',
  },
  solar: {
    title: 'Solar EV Charging & Panel Calculator | goinfoEV',
    description:
      'Size solar panels, inverter capacity, and battery backup for zero-cost daily EV charging at home with net-metering and off-grid support.',
    keywords:
      'solar EV charging calculator, solar panel size for electric bike, net metering EV charging, zero cost solar scooter charging',
    canonicalPath: '/solar',
    robots: 'index, follow',
    ogType: 'website',
    appCategory: 'UtilitiesApplication',
  },
  rider: {
    title: 'Delivery & Gig Rider EV Profit Calculator | goinfoEV',
    description:
      'Calculate daily and monthly net profit for Bykea, InDrive, Foodpanda, and global delivery riders switching from petrol to electric bikes.',
    keywords:
      'Bykea electric bike profit calculator, Foodpanda EV rider earnings, InDrive EV savings, delivery rider electric scooter ROI',
    canonicalPath: '/rider',
    robots: 'index, follow',
    ogType: 'website',
    appCategory: 'BusinessApplication',
  },
  'charging-stations': {
    title: 'EV Charging Stations & Showrooms Map | goinfoEV',
    description:
      'Locate electric vehicle charging stations, battery swap hubs, and verified EV dealerships across Karachi, Lahore, Islamabad, and nearby hubs.',
    keywords:
      'EV charging stations Pakistan, electric bike showrooms Karachi Lahore Islamabad, EV battery swap stations map',
    canonicalPath: '/charging-stations',
    robots: 'index, follow',
    ogType: 'website',
  },
  blogs: {
    title: 'EV Guides, Battery Tips & News Blog | goinfoEV',
    description:
      'Read 40+ expert EV guides on LFP batteries, electricity tariffs, solar charging, maintenance, and buyer checklists in English and Roman Urdu.',
    keywords:
      'EV blog Pakistan, electric scooter maintenance guides, LFP battery tips, NEPRA EV tariff guides, Roman Urdu EV articles',
    canonicalPath: '/blogs',
    robots: 'index, follow',
    ogType: 'website',
  },
  content: {
    title: 'EV Battery, Wiring & Buyer FAQs Guide | goinfoEV',
    description:
      'Explore EV battery chemistry comparisons, maintenance checklists, registration rules, and detailed EV FAQs for electric bike buyers worldwide.',
    keywords:
      'EV buyer checklist, electric bike FAQs, LFP vs graphene comparison, EV wiring safety, electric scooter registration Pakistan',
    canonicalPath: '/content',
    robots: 'index, follow',
    ogType: 'website',
  },
  about: {
    title: 'About goinfoEV – EV Analytics & Research Platform',
    description:
      'Learn how goinfoEV helps daily commuters, fleet owners, and global EV buyers make smart electric mobility decisions with calibrated tools.',
    keywords: 'about goinfoEV, Hamdan Mirza, OrinexAI EV research, Pakistan electric mobility analytics',
    canonicalPath: '/about',
    robots: 'index, follow',
    ogType: 'website',
  },
  contact: {
    title: 'Contact goinfoEV – EV Inquiries & Partnerships',
    description:
      'Contact the goinfoEV team for EV dealership listings, fleet analytics, technical support, sponsored placements, and partnership inquiries.',
    keywords: 'contact goinfoEV, EV dealership listing Pakistan, EV advertising partnerships',
    canonicalPath: '/contact',
    robots: 'index, follow',
    ogType: 'website',
  },
  admin: {
    title: 'Admin Portal – goinfoEV Platform Management',
    description:
      'Internal goinfoEV platform administration portal for managing EV catalog models, user subscriptions, and system configuration settings.',
    keywords: 'goinfoEV admin',
    canonicalPath: '/admin',
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
  'user-dashboard': {
    title: 'My EV Account & Subscription Dashboard | goinfoEV',
    description:
      'View your goinfoEV account status, remaining free calculator runs, subscription activation details, and recent EV simulation activity.',
    keywords: 'goinfoEV account dashboard',
    canonicalPath: '/user-dashboard',
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
};

export function buildModelSeo(model: EVModel, origin: string): SeoPayload {
  const fullName = `${model.brand} ${model.model}${model.variant ? ` (${model.variant})` : ''}`.trim();
  const title = clampTitle(`${fullName} Price & Specs`);
  const priceText = model.price ? `PKR ${model.price.toLocaleString('en-PK')}` : 'Contact showroom';
  const rangeText = model.rangeMin === model.rangeMax ? `${model.rangeMin} km` : `${model.rangeMin}-${model.rangeMax} km`;
  const rawDesc = `${fullName} specs: ${priceText} price, ${model.batteryLabel} (${model.batteryWh}Wh), ${rangeText} range, ${model.motor} motor & ${model.topSpeed} top speed.`;
  const description = clampDescription(rawDesc, ' Compare on goinfoEV.');

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fullName,
    brand: {
      '@type': 'Brand',
      name: model.brand,
    },
    category: model.category || 'Electric Two-Wheeler',
    description: model.note || description,
    url: `${origin}/ev/${model.id}`,
    ...(model.image
      ? { image: model.image.startsWith('http') ? model.image : `${origin}${model.image}` }
      : {}),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Battery Capacity', value: `${model.batteryWh} Wh (${model.batteryLabel})` },
      { '@type': 'PropertyValue', name: 'Battery Chemistry', value: model.chemistry.toUpperCase() },
      { '@type': 'PropertyValue', name: 'Range', value: rangeText },
      { '@type': 'PropertyValue', name: 'Motor Power', value: model.motor },
      { '@type': 'PropertyValue', name: 'Top Speed', value: model.topSpeed },
      { '@type': 'PropertyValue', name: 'Charge Time', value: model.chargeTime },
    ],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: model.price || 0,
      availability: 'https://schema.org/InStock',
      url: `${origin}/ev/${model.id}`,
    },
  };

  return {
    title,
    description,
    keywords: `${fullName}, ${model.brand} EV price Pakistan, ${model.model} range specs, ${model.batteryType} electric bike`,
    canonicalPath: `/ev/${model.id}`,
    robots: 'index, follow',
    ogType: 'product',
    jsonLd: [productSchema],
  };
}

export function buildBlogSeo(post: SeoBlogInput, origin: string): SeoPayload {
  const title = clampTitle(post.title);
  const description = clampDescription(post.excerpt);

  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author || 'goinfoEV Research',
    },
    publisher: {
      '@type': 'Organization',
      name: 'goinfoEV',
      logo: {
        '@type': 'ImageObject',
        url: `${origin}${DEFAULT_OG_IMAGE_PATH}`,
      },
    },
    mainEntityOfPage: `${origin}/blogs/${post.id}`,
    articleSection: post.category,
  };

  return {
    title,
    description,
    keywords: `${post.category}, ${post.title}, goinfoEV guides, electric vehicle tips`,
    canonicalPath: `/blogs/${post.id}`,
    robots: 'index, follow',
    ogType: 'article',
    jsonLd: [articleSchema],
  };
}

export function buildTabSeo(tab: SeoTabKey, origin: string): SeoPayload {
  const config = STATIC_ROUTE_SEO[tab] || STATIC_ROUTE_SEO.home;
  const schemas: Record<string, unknown>[] = [];

  if (tab === 'home') {
    schemas.push(...buildBaseSchemas(origin), buildFaqJsonLd());
  } else if (tab === 'content') {
    schemas.push(buildFaqJsonLd());
  } else if (config.appCategory) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: config.title,
      url: `${origin}${config.canonicalPath}`,
      applicationCategory: config.appCategory,
      operatingSystem: 'All',
      description: config.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
  } else {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: config.title,
      url: `${origin}${config.canonicalPath}`,
      description: config.description,
    });
  }

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    canonicalPath: config.canonicalPath,
    robots: config.robots,
    ogType: config.ogType,
    jsonLd: schemas,
  };
}

export function resolveSeoForPath(
  pathname: string,
  search: string,
  origin: string,
  models: EVModel[],
  posts: SeoBlogInput[],
): ResolvedSeo {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const segments = cleanPath.replace(/^\/+/, '').split('/').filter(Boolean);
  const searchParams = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);

  let payload: SeoPayload | null = null;

  // 1. Check /ev/:modelId or /products?model=:modelId
  const modelSlug =
    segments[0]?.toLowerCase() === 'ev' && segments[1]
      ? decodeURIComponent(segments[1])
      : searchParams.get('model');

  if (modelSlug) {
    const foundModel = models.find((m) => m.id.toLowerCase() === modelSlug.toLowerCase());
    if (foundModel) {
      payload = buildModelSeo(foundModel, origin);
    }
  }

  // 2. Check /blogs/:articleId or /blogs?article=:articleId
  if (!payload) {
    const blogSlug =
      segments[0]?.toLowerCase() === 'blogs' && segments[1]
        ? decodeURIComponent(segments[1])
        : searchParams.get('article');

    if (blogSlug) {
      const foundPost = posts.find((p) => p.id.toLowerCase() === blogSlug.toLowerCase());
      if (foundPost) {
        payload = buildBlogSeo(foundPost, origin);
      }
    }
  }

  // 3. Fallback to tab route
  if (!payload) {
    const candidate = (segments[0] || searchParams.get('tab') || searchParams.get('page') || 'home').toLowerCase();
    const tabKey = (candidate in STATIC_ROUTE_SEO ? candidate : 'home') as SeoTabKey;
    payload = buildTabSeo(tabKey, origin);
  }

  return {
    ...payload,
    canonicalUrl: `${origin}${payload.canonicalPath}`,
    ogImageUrl: `${origin}${DEFAULT_OG_IMAGE_PATH}`,
    siteName: SITE_NAME,
  };
}
