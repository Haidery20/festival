import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    const msg = "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (.env.local) and restart the dev server."
    // Provide clear feedback for developers
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error(msg)
    }
    throw new Error(msg)
  }

  supabaseClient = createBrowserClient(url, anon)
  return supabaseClient
}