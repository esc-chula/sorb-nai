import type { Config } from '@react-router/dev/config'

export default {
  // Use SSR build (default). Cloudflare plugin is disabled in Vite config to avoid build crash on Pages.
  ssr: true,
} satisfies Config
