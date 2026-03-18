/**
 * SEO Head Manager Component
 * Automatically manages meta tags for each page route
 * Usage: Wrap your app content or add to useEffect in each page
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setSEOMetaTags, SEO_CONFIG } from "./seoHelpers";

// Map routes to SEO configs
const ROUTE_SEO_MAP: Record<string, any> = {
  "/": SEO_CONFIG.home,
  "/pricing": SEO_CONFIG.pricing,
  "/docs": SEO_CONFIG.docs,
  "/login": SEO_CONFIG.login,
  "/signup": SEO_CONFIG.signup,
  "/privacy-policy": SEO_CONFIG.privacy,
  "/terms": SEO_CONFIG.terms,
  "/cookie-policy": SEO_CONFIG.privacy, // Reuse privacy config
  "/gdpr": SEO_CONFIG.gdpr,
};

/**
 * Hook to update SEO on route changes
 * Add this to your main App component
 */
export const useSEOPageManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Get current route
    const currentPath = location.pathname;

    // Find matching SEO config
    const seoConfig = ROUTE_SEO_MAP[currentPath];

    // Apply SEO tags if config exists
    if (seoConfig) {
      setSEOMetaTags(seoConfig);

      // Scroll to top on route change (helps with user experience and SEO)
      window.scrollTo(0, 0);
    }

    // Log for debugging (remove in production)
    console.log(`📄 Route changed to: ${currentPath}`, { seoConfig });
  }, [location]);
};

/**
 * Component wrapper for automatic SEO management
 * Usage:
 * <SEOPageManager>
 *   <App />
 * </SEOPageManager>
 */
export const SEOPageManager: React.FC<{ children: any }> = ({ children }) => {
  useSEOPageManager();
  return children;
};

/**
 * For page-specific SEO, import this in each page component:
 *
 * import { setSEOMetaTags, SEO_CONFIG } from '../utils/seoHelpers';
 *
 * export const MyPage = () => {
 *   useEffect(() => {
 *     setSEOMetaTags(SEO_CONFIG.myPage);
 *   }, []);
 *
 *   return (
 *     // Page content
 *   );
 * };
 */
