/**
 * SEO Utility for Dynamic Meta Tags
 * Helps set page-specific SEO meta tags and structured data
 */

interface SEOMetaTags {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string;
}

export const setSEOMetaTags = (tags: SEOMetaTags) => {
  // Set title
  if (tags.title) {
    document.title = tags.title;
    updateMetaTag("og:title", tags.ogTitle || tags.title);
    updateMetaTag("twitter:title", tags.twitterTitle || tags.title);
    updateMetaTag("name", tags.title);
  }

  // Set description
  if (tags.description) {
    updateMetaTag("description", tags.description);
    updateMetaTag("og:description", tags.ogDescription || tags.description);
    updateMetaTag(
      "twitter:description",
      tags.twitterDescription || tags.description,
    );
  }

  // Set keywords
  if (tags.keywords) {
    updateMetaTag("keywords", tags.keywords);
  }

  // Set images
  if (tags.ogImage) {
    updateMetaTag("og:image", tags.ogImage);
    updateMetaTag("twitter:image", tags.twitterImage || tags.ogImage);
  }

  // Set canonical URL
  if (tags.canonical) {
    setCanonical(tags.canonical);
  }

  // Set OG type
  if (tags.ogType) {
    updateMetaTag("og:type", tags.ogType);
  }
};

const updateMetaTag = (name: string, content: string) => {
  let element = document.querySelector(
    `meta[name="${name}"], meta[property="${name}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    if (name.startsWith("og:") || name.startsWith("twitter:")) {
      element.setAttribute("property", name);
    } else {
      element.setAttribute("name", name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const setCanonical = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
};

/**
 * Page-specific SEO configurations
 */
export const SEO_CONFIG = {
  home: {
    title: "Email Verification SaaS | Email Validator API | QuickMailFilter",
    description:
      "Professional email verification API. Validate emails, detect typos, check disposable addresses & SMTP verification. 50 free verifications. Perfect for businesses.",
    keywords:
      "email verification, email validator, email validation API, email verification service, disposable email detection",
    ogImage: "https://quickmailfilter.com/og-image.png",
    canonical: "https://quickmailfilter.com/",
  },
  pricing: {
    title: "Pricing Plans | Email Verification | QuickMailFilter",
    description:
      "Affordable email verification pricing. Free trial with 50 verifications. Business & Enterprise plans available. Start validating emails today.",
    keywords:
      "email verification pricing, email validator cost, email verification API plans, email validation pricing",
    ogImage: "https://quickmailfilter.com/pricing-og.png",
    canonical: "https://quickmailfilter.com/pricing",
  },
  docs: {
    title: "Documentation | Email Verification API | QuickMailFilter",
    description:
      "Complete API documentation for email verification. Learn how to integrate QuickMailFilter email validator into your application.",
    keywords:
      "email verification API docs, email validator documentation, API integration guide",
    ogImage: "https://quickmailfilter.com/docs-og.png",
    canonical: "https://quickmailfilter.com/docs",
  },
  login: {
    title: "Login | QuickMailFilter",
    description:
      "Sign in to your QuickMailFilter account to verify emails and manage your subscription.",
    canonical: "https://quickmailfilter.com/login",
  },
  signup: {
    title: "Sign Up | Free Email Verification | QuickMailFilter",
    description:
      "Create a free QuickMailFilter account. Get 50 free email verifications to validate your email lists.",
    keywords:
      "email verification free, free email validator, email validation trial",
    canonical: "https://quickmailfilter.com/signup",
  },
  privacy: {
    title: "Privacy Policy | QuickMailFilter",
    description:
      "Privacy Policy for QuickMailFilter email verification service.",
    canonical: "https://quickmailfilter.com/privacy-policy",
  },
  terms: {
    title: "Terms of Service | QuickMailFilter",
    description:
      "Terms of Service for QuickMailFilter email verification platform.",
    canonical: "https://quickmailfilter.com/terms",
  },
  gdpr: {
    title: "GDPR Compliance | QuickMailFilter",
    description:
      "GDPR compliance information and data processing details for QuickMailFilter.",
    canonical: "https://quickmailfilter.com/gdpr",
  },
};

/**
 * Add structured data (JSON-LD)
 */
export const setStructuredData = (data: any) => {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// FAQ Schema for documentation page
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is email verification?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Email verification is the process of checking if an email address is valid, active, and deliverable before sending messages to it.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is QuickMailFilter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "QuickMailFilter provides 99.9% accuracy using advanced validation techniques including regex checks, DNS verification, and SMTP validation.",
      },
    },
  ],
};

// Product Schema for pricing page
export const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "QuickMailFilter Email Verification",
  description: "Professional email verification service with free trial",
  brand: {
    "@type": "Brand",
    name: "QuickMailFilter",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "169",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "100",
  },
};
