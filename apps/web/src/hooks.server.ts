import { createServerClient } from '@supabase/ssr'
import { type Handle } from '@sveltejs/kit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  const timeout = new Promise<T>((resolve) => {
    setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeout]);
}

export const handle: Handle = async ({ event, resolve }) => {
  // Create a Supabase client for the server
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) => {
        event.cookies.set(key, value, { ...options, path: '/' })
      },
      remove: (key, options) => {
        event.cookies.delete(key, { ...options, path: '/' })
      },
    },
  })

  // Get the session with timeout (don't block if Supabase is unreachable)
  let session = null;
  try {
    const result = await withTimeout(
      event.locals.supabase.auth.getSession(),
      500, // 500ms timeout - fail fast when Supabase unavailable
      { data: { session: null }, error: null }
    );
    session = result.data.session;
  } catch (e) {
    // Supabase unreachable, continue without auth
    console.warn('Supabase auth check failed, continuing without auth');
  }

  // Set user in locals for easy access
  event.locals.user = session?.user
    ? {
        email: session.user.email ?? '',
        name: session.user.user_metadata?.name ?? session.user.email ?? '',
      }
    : null

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}
