import type { Config } from '@react-router/dev/config'

export default {
  // Use SSR build (default). Cloudflare runtime config is handled via wrangler.toml flags.
  ssr: true,
} satisfies Config
