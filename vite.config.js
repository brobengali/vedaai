import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: 'all',
    proxy: {
      '/api/analyze-exam': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => `/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY || 'AIzaSyCgaCHS0SXw-lzuJPsp9TBXbL9sRG5q3-I'}`
      }
    }
  }
});
