<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getState, isCdnEnabled } from '$lib/services/assetService';
  import { downloadedLessons, totalCacheSize, formatBytes, isPremium } from '$lib/stores/premium';

  interface LanguagePack {
    id: string;
    name: { source: string; target: string };
    flag: string;
    levels: string[];
    totalLessons: number;
    freeLessons: number;
    available: boolean;
  }

  // Available language packs
  const languagePacks: LanguagePack[] = [
    {
      id: 'de-fa',
      name: { source: 'Deutsch', target: 'آلمانی' },
      flag: '🇩🇪',
      levels: ['A1', 'A2', 'B1', 'B2'],
      totalLessons: 60,
      freeLessons: 6,
      available: true,
    },
    {
      id: 'en-fa',
      name: { source: 'English', target: 'انگلیسی' },
      flag: '🇬🇧',
      levels: ['A1', 'A2', 'B1', 'B2'],
      totalLessons: 60,
      freeLessons: 6,
      available: false, // Coming soon
    },
    {
      id: 'fr-fa',
      name: { source: 'Francais', target: 'فرانسوی' },
      flag: '🇫🇷',
      levels: ['A1', 'A2', 'B1', 'B2'],
      totalLessons: 60,
      freeLessons: 6,
      available: false, // Coming soon
    },
  ];

  // Active language (from assetService)
  $: activeLanguage = getState().languagePair;
  $: cdnEnabled = isCdnEnabled();

  // Count downloaded lessons per language
  function getDownloadedCount(languageId: string): number {
    return $downloadedLessons.filter(l => l.languagePair === languageId).length;
  }

  function selectLanguage(langId: string) {
    if (languagePacks.find(l => l.id === langId)?.available) {
      // In future: switch active language
      // For now, just go to home
      goto('/');
    }
  }
</script>

<div class="languages-page" dir="rtl">
  <header class="page-header">
    <h1>زبان‌های موجود</h1>
    <p class="subtitle">یک زبان را برای یادگیری انتخاب کنید</p>
  </header>

  <!-- Storage Info (Premium) -->
  {#if $isPremium && $totalCacheSize > 0}
    <div class="storage-info">
      <span class="storage-icon">💾</span>
      <span class="storage-text">فضای استفاده شده: {formatBytes($totalCacheSize)}</span>
    </div>
  {/if}

  <div class="language-grid">
    {#each languagePacks as lang}
      <button
        class="language-card"
        class:active={lang.id === activeLanguage}
        class:disabled={!lang.available}
        on:click={() => selectLanguage(lang.id)}
      >
        <div class="lang-flag">{lang.flag}</div>
        <div class="lang-info">
          <h2 class="lang-name">
            <span class="target-name">{lang.name.target}</span>
            <span class="source-name" dir="ltr">{lang.name.source}</span>
          </h2>
          <div class="lang-meta">
            <span class="levels">{lang.levels.join(' - ')}</span>
            <span class="lessons">{lang.totalLessons} درس</span>
          </div>
        </div>

        <div class="lang-status">
          {#if !lang.available}
            <span class="badge coming-soon">به زودی</span>
          {:else if lang.id === activeLanguage}
            <span class="badge active">فعال</span>
          {:else}
            <span class="badge">انتخاب</span>
          {/if}
        </div>

        <!-- Download status for premium -->
        {#if $isPremium && lang.available}
          {@const downloaded = getDownloadedCount(lang.id)}
          {#if downloaded > 0}
            <div class="download-status">
              <span class="download-icon">✓</span>
              <span class="download-text">{downloaded} درس دانلود شده</span>
            </div>
          {/if}
        {/if}
      </button>
    {/each}
  </div>

  <!-- CDN Status -->
  <div class="cdn-status">
    {#if cdnEnabled}
      <span class="cdn-badge online">⚡ محتوا از CDN</span>
    {:else}
      <span class="cdn-badge local">📱 محتوای محلی</span>
    {/if}
  </div>

  <!-- Premium Upsell -->
  {#if !$isPremium}
    <div class="premium-upsell">
      <div class="upsell-icon">👑</div>
      <div class="upsell-content">
        <h3>نسخه پرمیوم</h3>
        <p>دانلود درس‌ها برای استفاده آفلاین</p>
      </div>
      <a href="/premium" class="upsell-button">ارتقا</a>
    </div>
  {/if}
</div>

<style>
  .languages-page {
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .page-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
    color: #1e293b;
    margin: 0 0 0.5rem;
  }

  .subtitle {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0;
  }

  .storage-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f0fdf4;
    border-radius: 8px;
    margin-bottom: 1rem;
    color: #166534;
    font-size: 0.9rem;
  }

  .language-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .language-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: right;
    position: relative;
  }

  .language-card:hover:not(.disabled) {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .language-card.active {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .language-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .lang-flag {
    font-size: 2.5rem;
  }

  .lang-info {
    flex: 1;
  }

  .lang-name {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
  }

  .target-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .source-name {
    font-size: 0.9rem;
    color: #64748b;
  }

  .lang-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .lang-status {
    display: flex;
    align-items: center;
  }

  .badge {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
    background: #e2e8f0;
    color: #64748b;
  }

  .badge.active {
    background: #dcfce7;
    color: #166534;
  }

  .badge.coming-soon {
    background: #fef3c7;
    color: #92400e;
  }

  .download-status {
    position: absolute;
    bottom: 0.5rem;
    left: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #22c55e;
  }

  .cdn-status {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .cdn-badge {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.8rem;
  }

  .cdn-badge.online {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .cdn-badge.local {
    background: #f1f5f9;
    color: #64748b;
  }

  .premium-upsell {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 16px;
    margin-top: 1.5rem;
  }

  .upsell-icon {
    font-size: 2rem;
  }

  .upsell-content {
    flex: 1;
  }

  .upsell-content h3 {
    margin: 0;
    font-size: 1rem;
    color: #92400e;
  }

  .upsell-content p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: #a16207;
  }

  .upsell-button {
    padding: 0.5rem 1.25rem;
    background: #f59e0b;
    color: white;
    border-radius: 999px;
    font-weight: 500;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .upsell-button:hover {
    background: #d97706;
  }
</style>
