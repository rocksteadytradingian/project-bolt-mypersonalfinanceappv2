import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '', // Empty base for proper path resolution
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            'firebase/app',
            'firebase/auth',
            'firebase/firestore'
          ],
          'charts': [
            'recharts',
            'd3-shape',
            'd3-scale',
            'd3-array'
          ],
          'utils': [
            'lodash',
            'date-fns',
            'uuid'
          ],
          'ui': [
            '@heroicons/react',
            '@headlessui/react'
          ]
        },
        // Optimize chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize build performance while preserving important logs
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
        pure_funcs: ['console.debug', 'console.trace'] // Only remove debug/trace logs
      },
      format: {
        comments: false,
        max_line_len: 120
      }
    },
    // Add source maps for better error tracking
    sourcemap: 'hidden'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore']
  }
});
