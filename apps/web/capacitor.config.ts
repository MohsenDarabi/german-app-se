import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.germanapp.se',
  appName: 'German Learning',
  webDir: 'build',

  // Server configuration
  server: {
    // Allow loading from CDN
    allowNavigation: [
      'pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev',
      '*.supabase.co'
    ],
    // Clear text traffic for development (remove in production)
    cleartext: false
  },

  // iOS specific settings
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    scheme: 'German Learning'
  },

  // Android specific settings
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true // Allow HTTP content in HTTPS context (for dev)
  },

  // Plugins configuration
  plugins: {
    // Filesystem plugin for offline storage
    Filesystem: {
      // No special config needed
    },
    // Network plugin for connectivity detection
    Network: {
      // No special config needed
    }
  }
};

export default config;
