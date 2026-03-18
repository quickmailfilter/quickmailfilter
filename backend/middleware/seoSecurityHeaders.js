/**
 * HTTP Security Headers Middleware
 * Improves SEO, security, and performance
 */

module.exports = function seoSecurityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Referrer Policy for privacy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), accelerometer=(), gyroscope=(), magnetometer=(), payment=()",
  );

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.jsdelivr.net https://api.razorpay.com https://browser.sentry-cdn.com https://api.sardine.ai; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https: ws: wss:; " +
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'",
  );

  // Enable HSTS (only on HTTPS)
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  next();
};
