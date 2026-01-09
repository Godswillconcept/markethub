import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Single Domain Development Configuration
  server: {
    port: 5173, // Default port
    host: true, // Allow external access
    // Restrict file system access to prevent Vite from accessing server-side files
    fs: {
      strict: true,
      allow: ['.']
    },
    proxy: {
      // Proxy API requests to backend server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // Preview configuration for production deployment
  preview: {
    port: 4173, // Changed from 8080 to avoid conflict
    host: '0.0.0.0'
  },

  // Optimized Build configuration for Vercel deployment
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Optimize for production
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps for faster builds
    // Ensure relative paths for assets in production
    assetsInlineLimit: 4096,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@heroicons/react'],
          utils: ['axios', 'date-fns', 'clsx']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
      '@heroicons/react'
    ]
  }
});
