/**
 * Web Vitals & Performance Monitoring
 * Tracks Core Web Vitals, performance metrics, and sends to analytics
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from "web-vitals";

// Extend Window type for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: Record<string, any>,
    ) => void;
  }
}

// Core Web Vitals thresholds
const WEB_VITALS_THRESHOLDS = {
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 600, needsImprovement: 1800 }, // Time to First Byte
};

/**
 * Get rating for a metric
 */
const getRating = (
  name: string,
  value: number,
): "good" | "needs-improvement" | "poor" => {
  const threshold =
    WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS];

  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.needsImprovement) return "needs-improvement";
  return "poor";
};

/**
 * Initialize Web Vitals monitoring
 */
export const initWebVitalsMonitoring = (): void => {
  // For production environment
  if (process.env.NODE_ENV === "production") {
    // Send to Google Analytics
    onCLS((metric: Metric) => {
      sendToAnalytics("CLS", metric.value, getRating("CLS", metric.value));
    });

    onFID((metric: Metric) => {
      sendToAnalytics("FID", metric.value, getRating("FID", metric.value));
    });

    onFCP((metric: Metric) => {
      sendToAnalytics("FCP", metric.value, getRating("FCP", metric.value));
    });

    onLCP((metric: Metric) => {
      sendToAnalytics("LCP", metric.value, getRating("LCP", metric.value));
    });

    onTTFB((metric: Metric) => {
      sendToAnalytics("TTFB", metric.value, getRating("TTFB", metric.value));
    });
  }
};

/**
 * Send metrics to Google Analytics
 */
const sendToAnalytics = (name: string, value: number, rating: string): void => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, {
      value: Math.round(value),
      event_category: "Web Vitals",
      event_label: name,
      non_interaction: true,
      metric_rating: rating,
    });
  }
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = async (): Promise<
  Record<string, number>
> => {
  const metrics: Record<string, number> = {};

  return new Promise((resolve) => {
    let completed = 0;

    onCLS((metric: Metric) => {
      metrics.CLS = Math.round(metric.value * 1000) / 1000;
      if (++completed === 5) resolve(metrics);
    });

    onFID((metric: Metric) => {
      metrics.FID = Math.round(metric.value);
      if (++completed === 5) resolve(metrics);
    });

    onFCP((metric: Metric) => {
      metrics.FCP = Math.round(metric.value);
      if (++completed === 5) resolve(metrics);
    });

    onLCP((metric: Metric) => {
      metrics.LCP = Math.round(metric.value);
      if (++completed === 5) resolve(metrics);
    });

    onTTFB((metric: Metric) => {
      metrics.TTFB = Math.round(metric.value);
      if (++completed === 5) resolve(metrics);
    });
  });
};

/**
 * Log performance metrics to console (development only)
 */
export const logPerformanceMetrics = (): void => {
  if (process.env.NODE_ENV === "development") {
    onCLS((metric: Metric) => {
      console.log("📊 CLS:", metric.value, getRating("CLS", metric.value));
    });

    onFID((metric: Metric) => {
      console.log(
        "📊 FID:",
        metric.value,
        "ms",
        getRating("FID", metric.value),
      );
    });

    onFCP((metric: Metric) => {
      console.log(
        "📊 FCP:",
        metric.value,
        "ms",
        getRating("FCP", metric.value),
      );
    });

    onLCP((metric: Metric) => {
      console.log(
        "📊 LCP:",
        metric.value,
        "ms",
        getRating("LCP", metric.value),
      );
    });

    onTTFB((metric: Metric) => {
      console.log(
        "📊 TTFB:",
        metric.value,
        "ms",
        getRating("TTFB", metric.value),
      );
    });

    // Navigation timing
    window.addEventListener("load", () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log("📊 Page Load Time:", pageLoadTime, "ms");
    });
  }
};

/**
 * Monitor long tasks (takes > 50ms)
 */
export const initLongTaskMonitoring = () => {
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn("🐢 Long Task detected:", {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });

      observer.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      // Silence errors in browsers that don't support longtask
    }
  }
};

/**
 * Monitor resource timing
 */
export const getResourceMetrics = () => {
  const resources = performance.getEntries() as PerformanceResourceTiming[];
  const summary = {
    totalResources: resources.length,
    totalSize: 0,
    avgLoadTime: 0,
    slowResources: [] as string[],
  };

  resources.forEach((resource) => {
    summary.totalSize += resource.transferSize || 0;
    summary.avgLoadTime += resource.duration || 0;

    // Find slow resources (> 1000ms)
    if ((resource.duration || 0) > 1000) {
      summary.slowResources.push(resource.name);
    }
  });

  summary.avgLoadTime = summary.avgLoadTime / resources.length;
  return summary;
};

// Auto-export web-vitals for easier imports
export { onCLS, onFID, onFCP, onLCP, onTTFB } from "web-vitals";
export type { Metric } from "web-vitals";
