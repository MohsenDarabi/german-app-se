// Deep Link Handler for OAuth callbacks in Capacitor
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { supabase } from '$lib/supabase/client';
import { goto } from '$app/navigation';

// Custom URL scheme for the app
export const APP_SCHEME = 'com.germanapp.se';
export const OAUTH_CALLBACK_PATH = '/auth/callback';

// Get the OAuth redirect URL based on platform
export function getOAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    // Native app: use custom URL scheme
    return `${APP_SCHEME}://auth/callback`;
  } else {
    // Web: use current origin
    return `${window.location.origin}/auth/callback`;
  }
}

// Initialize deep link listener
export function initDeepLinkHandler(): void {
  if (!Capacitor.isNativePlatform()) {
    console.log('[DeepLink] Not a native platform, skipping deep link handler');
    return;
  }

  console.log('[DeepLink] Initializing deep link handler');

  // Listen for app URL open events
  App.addListener('appUrlOpen', async ({ url }) => {
    console.log('[DeepLink] Received URL:', url);

    try {
      // Parse the URL
      const parsedUrl = new URL(url);

      // Check if this is an OAuth callback
      if (parsedUrl.pathname === OAUTH_CALLBACK_PATH || url.includes('auth/callback')) {
        console.log('[DeepLink] Processing OAuth callback');

        // Extract tokens from URL
        const params = new URLSearchParams(parsedUrl.search);
        const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));

        // Close the browser that was opened for OAuth
        try {
          await Browser.close();
        } catch {
          // Browser might already be closed
        }

        // Check for authorization code (PKCE flow)
        const code = params.get('code');
        if (code) {
          console.log('[DeepLink] Found authorization code, exchanging for session');
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('[DeepLink] Error exchanging code:', error);
            goto('/login?error=auth_failed');
            return;
          }

          console.log('[DeepLink] Session established successfully');
          goto('/');
          return;
        }

        // Check for access token (implicit flow)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          console.log('[DeepLink] Found access token, setting session');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('[DeepLink] Error setting session:', error);
            goto('/login?error=auth_failed');
            return;
          }

          console.log('[DeepLink] Session set successfully');
          goto('/');
          return;
        }

        // Check for error
        const error = params.get('error') || hashParams.get('error');
        if (error) {
          console.error('[DeepLink] OAuth error:', error);
          goto(`/login?error=${error}`);
          return;
        }

        console.log('[DeepLink] No tokens found in callback URL');
        goto('/login?error=no_tokens');
      }
    } catch (err) {
      console.error('[DeepLink] Error processing URL:', err);
      goto('/login?error=parse_failed');
    }
  });

  // Check if app was opened with a URL
  App.getLaunchUrl().then(({ url }) => {
    if (url) {
      console.log('[DeepLink] App launched with URL:', url);
      // The appUrlOpen listener will handle it
    }
  });
}
