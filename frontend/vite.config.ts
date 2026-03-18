import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Optimization for better performance
  build: {
    target: "ES2020",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["lucide-react", "sonner", "aos"],
          "vendor-firebase": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/storage",
          ],
          "vendor-form": ["react-hook-form"],

          // Feature chunks
          admin: [
            "./src/app/pages/AdminDashboard.tsx",
            "./src/app/pages/AdminUsersPage.tsx",
            "./src/app/pages/AdminLogsPage.tsx",
            "./src/app/pages/AdminSettingsPage.tsx",
          ],
          auth: [
            "./src/app/pages/LoginPage.tsx",
            "./src/app/pages/SignupPage.tsx",
            "./src/app/pages/ForgotPasswordPage.tsx",
          ],
          payment: [
            "./src/app/components/PaymentCheckout.tsx",
            "./src/app/pages/PaymentSuccessPage.tsx",
            "./src/app/pages/MyPlanPage.tsx",
          ],
        },
      },
    },
    // Increase chunk size limit
    chunkSizeWarningLimit: 1000,
  },

  // Server configuration
  server: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-XSS-Protection": "1; mode=block",
    },
  },

  // Assets include
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
