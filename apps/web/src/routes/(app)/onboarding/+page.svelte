<script lang="ts">
  import { goto } from '$app/navigation';
  import {
    languagePreference,
    LANGUAGE_PACKS,
    type LanguagePack
  } from '$lib/stores/languagePreference';
  import { init as initAssetService, initShared } from '$lib/services/assetService';

  let selectedLang: string | null = null;
  let isSubmitting = false;

  function handleSelectLanguage(pack: LanguagePack) {
    if (!pack.available) return;
    selectedLang = pack.id;
  }

  async function handleContinue() {
    if (!selectedLang) return;

    isSubmitting = true;

    try {
      // Set language preference
      languagePreference.setLanguage(selectedLang);

      // Initialize asset service for new language
      try {
        await initShared(); // Load shared images manifest (only once)
        await initAssetService(selectedLang);
      } catch (e) {
        console.warn('[Onboarding] Asset service init warning:', e);
      }

      // Mark onboarding complete
      languagePreference.completeOnboarding();

      // Navigate to home
      goto('/');
    } catch (e) {
      console.error('[Onboarding] Error:', e);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Select Language - Deutschlern</title>
</svelte:head>

<div class="onboarding-page" dir="rtl">
  <div class="content">
    <header class="header">
      <div class="logo">📚</div>
      <h1>به یادگیری زبان خوش آمدید!</h1>
      <p class="subtitle">کدام زبان را می‌خواهید یاد بگیرید؟</p>
    </header>

    <div class="language-grid">
      {#each LANGUAGE_PACKS as pack}
        <button
          class="language-card"
          class:selected={selectedLang === pack.id}
          class:disabled={!pack.available}
          on:click={() => handleSelectLanguage(pack)}
          disabled={!pack.available}
        >
          <span class="flag">{pack.flag}</span>
          <div class="lang-info">
            <span class="lang-name">{pack.name.target}</span>
            <span class="lang-native" dir="ltr">{pack.name.source}</span>
          </div>
          {#if !pack.available}
            <span class="badge coming-soon">به زودی</span>
          {:else if selectedLang === pack.id}
            <span class="badge selected-badge">✓</span>
          {/if}
        </button>
      {/each}
    </div>

    <button
      class="continue-btn"
      disabled={!selectedLang || isSubmitting}
      on:click={handleContinue}
    >
      {isSubmitting ? 'در حال ذخیره...' : 'شروع یادگیری'}
    </button>

    <p class="note">می‌توانید بعداً از صفحه زبان‌ها تغییر دهید.</p>
  </div>
</div>

<style>
  .onboarding-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .content {
    max-width: 480px;
    width: 100%;
    background: white;
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem;
  }

  .subtitle {
    font-size: 1rem;
    color: #64748b;
    margin: 0;
  }

  .language-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .language-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: right;
  }

  .language-card:hover:not(.disabled) {
    border-color: #3b82f6;
    background: white;
  }

  .language-card.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .language-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .flag {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .lang-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .lang-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
  }

  .lang-native {
    font-size: 0.875rem;
    color: #64748b;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .badge.coming-soon {
    background: #fef3c7;
    color: #92400e;
  }

  .badge.selected-badge {
    background: #3b82f6;
    color: white;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
  }

  .continue-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 9999px;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }

  .continue-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }

  .continue-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .note {
    text-align: center;
    font-size: 0.875rem;
    color: #94a3b8;
    margin-top: 1rem;
    margin-bottom: 0;
  }
</style>
