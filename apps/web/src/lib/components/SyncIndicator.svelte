<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { syncEngine } from '$lib/services/syncEngine';
  import { supabase } from '$lib/supabase/client';

  let isSyncing = false;
  let lastSyncTime: Date | null = null;
  let isOnline = true;
  let isAuthenticated = false;
  let checkInterval: number;
  let authUnsubscribe: (() => void) | null = null;

  onMount(() => {
    // Check initial online status
    if (typeof navigator !== 'undefined') {
      isOnline = navigator.onLine;
    }

    // Check authentication status (async but we don't await)
    supabase.auth.getSession().then(({ data: { session } }) => {
      isAuthenticated = !!session;
    });

    // Get initial sync time
    lastSyncTime = syncEngine.getLastSyncTime();

    // Set up interval to check sync status
    checkInterval = window.setInterval(() => {
      isSyncing = syncEngine.isSyncing();
      lastSyncTime = syncEngine.getLastSyncTime();
    }, 1000); // Check every second

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      isAuthenticated = !!session;
    });
    authUnsubscribe = () => authListener.subscription.unsubscribe();

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (authUnsubscribe) authUnsubscribe();
    };
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  });

  function handleOnline() {
    isOnline = true;
  }

  function handleOffline() {
    isOnline = false;
  }

  function formatTime(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  $: syncStatus = getSyncStatus(isAuthenticated, isOnline, isSyncing, lastSyncTime);

  function getSyncStatus(
    authenticated: boolean,
    online: boolean,
    syncing: boolean,
    lastSync: Date | null
  ): string {
    if (!authenticated) return 'Not signed in';
    if (!online) return 'Offline';
    if (syncing) return 'Syncing...';
    if (lastSync) return `Synced ${formatTime(lastSync)}`;
    return 'Not synced';
  }

  $: statusClass = getStatusClass(isAuthenticated, isOnline, isSyncing);

  function getStatusClass(
    authenticated: boolean,
    online: boolean,
    syncing: boolean
  ): string {
    if (!authenticated) return 'not-authenticated';
    if (!online) return 'offline';
    if (syncing) return 'syncing';
    return 'synced';
  }
</script>

<div class="sync-indicator {statusClass}">
  <span class="sync-dot"></span>
  <span class="sync-text">{syncStatus}</span>
</div>

<style>
  .sync-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: #f1f5f9;
    border-radius: 999px;
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
    transition: all 0.2s;
  }

  .sync-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
    transition: all 0.3s;
  }

  /* Status-specific styles */
  .sync-indicator.synced .sync-dot {
    background: #22c55e;
  }

  .sync-indicator.syncing .sync-dot {
    background: #3b82f6;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .sync-indicator.offline .sync-dot {
    background: #f59e0b;
  }

  .sync-indicator.not-authenticated .sync-dot {
    background: #94a3b8;
  }

  /* Pulse animation for syncing */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }

  /* Hover effect */
  .sync-indicator:hover {
    background: #e2e8f0;
  }

  /* Mobile responsive */
  @media (max-width: 600px) {
    .sync-indicator {
      font-size: 0.7rem;
      padding: 0.3rem 0.6rem;
    }

    .sync-dot {
      width: 6px;
      height: 6px;
    }
  }
</style>
