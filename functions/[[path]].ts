// Cloudflare Pages Functions entry for React Router SSR
import { createRequestHandler } from '@react-router/cloudflare'
// Declare the built server module to silence TS complaints during local typecheck
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - built at compile time
import * as build from '../build/server/index.js'

// Export an onRequest handler that delegates to React Router's request handler
export const onRequest = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  // Provide env vars to route loaders/actions at runtime
  getLoadContext({ context }) {
    const env = (context as any).cloudflare?.env ?? {}
    return {
      FILE_PATH: env.FILE_PATH,
      ISE_FILE_PATH: env.ISE_FILE_PATH,
    }
  },
})
