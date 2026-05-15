import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function supabasePreconnect(): Plugin {
  let supabaseOrigin = ''
  return {
    name: 'supabase-preconnect',
    configResolved(config) {
      const url = (config.env['VITE_SUPABASE_URL'] ?? process.env.VITE_SUPABASE_URL ?? '') as string
      try {
        if (url) supabaseOrigin = new URL(url).origin
      } catch { /* invalid URL — skip */ }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!supabaseOrigin) return html
        return html.replace(
          '<link rel="icon"',
          `<link rel="preconnect" href="${supabaseOrigin}">\n    <link rel="icon"`,
        )
      },
    },
  }
}

function prioritizeCss(): Plugin {
  return {
    name: 'prioritize-css',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const match = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)
        if (!match) return html
        const [tag, href] = match
        html = html.replace(tag, '')
        return html.replace(
          '<link rel="icon"',
          `<link rel="preload" as="style" fetchpriority="high" href="${href}">\n    <link rel="stylesheet" crossorigin fetchpriority="high" href="${href}">\n    <link rel="icon"`,
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), supabasePreconnect(), prioritizeCss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/chapter-club/',
  build: {
    minify: 'esbuild',
    esbuildOptions: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
