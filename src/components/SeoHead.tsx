import React, { useEffect } from 'react';
import type { EVModel } from '../data/evModels';
import {
  buildBlogSeo,
  buildModelSeo,
  buildTabSeo,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  type SeoBlogInput,
  type SeoTabKey,
} from '../seo/seoConfig';

interface SeoHeadProps {
  activeTab: SeoTabKey;
  activeModel?: EVModel | null;
  activeArticle?: SeoBlogInput | null;
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  activeTab,
  activeModel,
  activeArticle,
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const origin = window.location.origin;
    const payload =
      activeTab === 'products' && activeModel
        ? buildModelSeo(activeModel, origin)
        : activeTab === 'blogs' && activeArticle
        ? buildBlogSeo(activeArticle, origin)
        : buildTabSeo(activeTab, origin);

    const canonicalUrl = `${origin}${payload.canonicalPath}`;
    const ogImageUrl = `${origin}${DEFAULT_OG_IMAGE_PATH}`;

    document.title = payload.title;
    upsertMetaTag('name', 'description', payload.description);
    upsertMetaTag('name', 'keywords', payload.keywords);
    upsertMetaTag('name', 'robots', payload.robots);

    upsertCanonicalLink(canonicalUrl);

    upsertMetaTag('property', 'og:type', payload.ogType);
    upsertMetaTag('property', 'og:title', payload.title);
    upsertMetaTag('property', 'og:description', payload.description);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:site_name', SITE_NAME);
    upsertMetaTag('property', 'og:image', ogImageUrl);
    upsertMetaTag('property', 'og:image:alt', `${SITE_NAME} Electric Vehicle Calculators & Fleet Analytics`);

    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', payload.title);
    upsertMetaTag('name', 'twitter:description', payload.description);
    upsertMetaTag('name', 'twitter:image', ogImageUrl);

    // Update JSON-LD structured data scripts cleanly
    const existingScripts = document.head.querySelectorAll('script[data-seo-jsonld="true"]');
    existingScripts.forEach((node) => node.remove());

    payload.jsonLd.forEach((schemaObj) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    });
  }, [activeTab, activeModel, activeArticle]);

  return null;
};
