import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Support both Node (process.env) and Cloudflare Pages/Workers (import.meta.env)
const runtimeEnvRaw: Record<string, unknown> =
  typeof process !== 'undefined' && (process as any).env
    ? (process as any).env
    : ((import.meta as any).env ?? {})

// Map client-provided VITE_* variables to server keys when not present
const runtimeEnv: Record<string, string | number | boolean | undefined> = {}
for (const [key, value] of Object.entries(runtimeEnvRaw)) {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined'
  ) {
    runtimeEnv[key] = value
  } else if (value != null) {
    runtimeEnv[key] = String(value)
  }
}
if (!runtimeEnv['FILE_PATH'] && runtimeEnv['VITE_FILE_PATH']) {
  runtimeEnv['FILE_PATH'] = runtimeEnv['VITE_FILE_PATH']
}
if (!runtimeEnv['ISE_FILE_PATH'] && runtimeEnv['VITE_ISE_FILE_PATH']) {
  runtimeEnv['ISE_FILE_PATH'] = runtimeEnv['VITE_ISE_FILE_PATH']
}

export const env = createEnv({
  server: {
    FILE_PATH: z.string().url().optional(),
    ISE_FILE_PATH: z.string().url().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    /**
     * The Google Tag Manager ID. This is used to track page views and events
     * in Google Analytics.
     */
    VITE_GTAG_ID: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
