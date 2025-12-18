// See https://kit.svelte.dev/docs/types#app
import type { SupabaseClient } from '@supabase/supabase-js'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient
      user: {
        email: string
        name?: string | null
      } | null
    }

    interface PageData {
      user?: {
        email: string
        name?: string | null
      } | null
    }
  }
}

export {}