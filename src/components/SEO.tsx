import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string; // e.g., website, article, product
  structuredData?: Record<string, any>;
}

// Lightweight SEO component without external deps
const SEO = ({ title, description, canonical, image, type = "website", structuredData }: SEOProps) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMetaTag('property', 'og:title', title);
    }
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
    }

    const url = canonical || (typeof window !== 'undefined' ? window.location.href : undefined);
    if (url) {
      setCanonical(url);
      setMetaTag('property', 'og:url', url);
    }

    if (image) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
    }

    setMetaTag('property', 'og:type', type);
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    if (structuredData) {
      setJsonLd(structuredData);
    }
  }, [title, description, canonical, image, type, structuredData]);

  return null;
};

function setMetaTag(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(url: string) {
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(data: Record<string, any>) {
  let script = document.getElementById('ld-json') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    (script as HTMLScriptElement).type = 'application/ld+json';
    script.id = 'ld-json';
    document.head.appendChild(script);
  }
  (script as HTMLScriptElement).textContent = JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  });
}

export default SEO;
