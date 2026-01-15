<script lang="ts">
  /**
   * Design System Demo Page
   *
   * Preview all the new Persian-inspired UI components and colors.
   */
  import { Button, XPBar, StreakCounter } from '@pkg/ui';
  import { theme, isDarkMode } from '$lib/stores/theme';

  let currentXP = 65;
  let levelXP = 100;
  let level = 7;
  let streak = 14;
  let loading = false;

  function addXP() {
    currentXP = Math.min(currentXP + 15, levelXP);
    if (currentXP >= levelXP) {
      level++;
      currentXP = 0;
    }
  }

  function toggleLoading() {
    loading = !loading;
  }
</script>

<svelte:head>
  <title>Design System Demo - Persian Colors</title>
</svelte:head>

<div class="demo-page">
  <header class="demo-header">
    <h1 class="demo-title">سیستم طراحی جدید</h1>
    <p class="demo-subtitle">New Design System with Persian Colors</p>

    <button class="theme-toggle" on:click={() => theme.toggle()}>
      {$isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  </header>

  <!-- Color Palette Section -->
  <section class="demo-section">
    <h2 class="section-title">🎨 Persian Color Palette</h2>

    <div class="color-grid">
      <div class="color-card">
        <div class="color-swatch primary"></div>
        <span class="color-name">فیروزه‌ای</span>
        <span class="color-label">Turquoise</span>
      </div>
      <div class="color-card">
        <div class="color-swatch success"></div>
        <span class="color-name">طلایی</span>
        <span class="color-label">Gold</span>
      </div>
      <div class="color-card">
        <div class="color-swatch xp"></div>
        <span class="color-name">لاجوردی</span>
        <span class="color-label">Indigo</span>
      </div>
      <div class="color-card">
        <div class="color-swatch streak"></div>
        <span class="color-name">زعفرانی</span>
        <span class="color-label">Saffron</span>
      </div>
      <div class="color-card">
        <div class="color-swatch error"></div>
        <span class="color-name">زرشکی</span>
        <span class="color-label">Burgundy</span>
      </div>
      <div class="color-card">
        <div class="color-swatch gem"></div>
        <span class="color-name">زمردی</span>
        <span class="color-label">Emerald</span>
      </div>
      <div class="color-card">
        <div class="color-swatch accent"></div>
        <span class="color-name">گلابی</span>
        <span class="color-label">Rose</span>
      </div>
      <div class="color-card">
        <div class="color-swatch neutral"></div>
        <span class="color-name">کرم</span>
        <span class="color-label">Cream</span>
      </div>
    </div>
  </section>

  <!-- Gamification Components -->
  <section class="demo-section">
    <h2 class="section-title">🎮 Gamification Components</h2>

    <div class="component-showcase">
      <div class="showcase-item">
        <h3>XP Bar (نوار تجربه)</h3>
        <XPBar {currentXP} {levelXP} {level} />
        <Button variant="primary" size="sm" on:click={addXP}>+15 XP</Button>
      </div>

      <div class="showcase-item">
        <h3>Streak Counter (شمارنده استریک)</h3>
        <div class="streak-demo">
          <StreakCounter streak={0} size="sm" />
          <StreakCounter streak={5} size="md" />
          <StreakCounter {streak} size="lg" />
        </div>
      </div>
    </div>
  </section>

  <!-- Button Variants -->
  <section class="demo-section">
    <h2 class="section-title">🔘 Button Variants</h2>

    <div class="button-grid">
      <div class="button-row">
        <span class="variant-label">Primary (فیروزه‌ای)</span>
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
      </div>

      <div class="button-row">
        <span class="variant-label">Success (طلایی)</span>
        <Button variant="success" size="sm">Small</Button>
        <Button variant="success" size="md">Medium</Button>
        <Button variant="success" size="lg">Large</Button>
      </div>

      <div class="button-row">
        <span class="variant-label">Secondary (کرم)</span>
        <Button variant="secondary" size="sm">Small</Button>
        <Button variant="secondary" size="md">Medium</Button>
        <Button variant="secondary" size="lg">Large</Button>
      </div>

      <div class="button-row">
        <span class="variant-label">Error (زرشکی)</span>
        <Button variant="error" size="sm">Small</Button>
        <Button variant="error" size="md">Medium</Button>
        <Button variant="error" size="lg">Large</Button>
      </div>

      <div class="button-row">
        <span class="variant-label">Ghost</span>
        <Button variant="ghost" size="sm">Small</Button>
        <Button variant="ghost" size="md">Medium</Button>
        <Button variant="ghost" size="lg">Large</Button>
      </div>

      <div class="button-row">
        <span class="variant-label">States</span>
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="primary" {loading} on:click={toggleLoading}>
          {loading ? 'Loading...' : 'Click to Load'}
        </Button>
        <Button variant="primary" fullWidth>Full Width</Button>
      </div>
    </div>
  </section>

  <!-- Animation Demo -->
  <section class="demo-section">
    <h2 class="section-title">✨ Animations</h2>

    <div class="animation-grid">
      <div class="animation-card bounce">
        <span>Bounce</span>
      </div>
      <div class="animation-card shake">
        <span>Shake</span>
      </div>
      <div class="animation-card pulse">
        <span>Pulse Glow</span>
      </div>
      <div class="animation-card wiggle">
        <span>Wiggle</span>
      </div>
    </div>
  </section>
</div>

<style>
  .demo-page {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
  }

  .demo-header {
    text-align: center;
    margin-bottom: var(--space-10);
  }

  .demo-title {
    font-size: var(--text-3xl);
    font-weight: var(--font-extrabold);
    color: var(--color-primary-600);
    margin: 0 0 var(--space-2);
  }

  .demo-subtitle {
    font-size: var(--text-lg);
    color: var(--color-neutral-500);
    margin: 0 0 var(--space-4);
  }

  .theme-toggle {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    border: 2px solid var(--color-neutral-200);
    background: var(--color-neutral-50);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--transition-normal);
  }

  .theme-toggle:hover {
    background: var(--color-neutral-100);
  }

  .demo-section {
    margin-bottom: var(--space-12);
  }

  .section-title {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--color-neutral-800);
    margin: 0 0 var(--space-6);
    padding-bottom: var(--space-3);
    border-bottom: 2px solid var(--color-neutral-200);
  }

  /* Color Palette */
  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--space-4);
  }

  .color-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .color-swatch {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-bounce);
  }

  .color-swatch:hover {
    transform: scale(1.1);
  }

  .color-swatch.primary { background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600)); }
  .color-swatch.success { background: linear-gradient(135deg, var(--color-success-400), var(--color-success-600)); }
  .color-swatch.xp { background: linear-gradient(135deg, var(--color-xp-400), var(--color-xp-600)); }
  .color-swatch.streak { background: linear-gradient(135deg, var(--color-streak-400), var(--color-streak-600)); }
  .color-swatch.error { background: linear-gradient(135deg, var(--color-error-400), var(--color-error-600)); }
  .color-swatch.gem { background: linear-gradient(135deg, var(--color-gem-400), var(--color-gem-600)); }
  .color-swatch.accent { background: linear-gradient(135deg, var(--color-accent-400), var(--color-accent-600)); }
  .color-swatch.neutral { background: linear-gradient(135deg, var(--color-neutral-100), var(--color-neutral-300)); }

  .color-name {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--color-neutral-700);
  }

  .color-label {
    font-size: var(--text-xs);
    color: var(--color-neutral-500);
  }

  /* Component Showcase */
  .component-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .showcase-item {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-2xl);
    padding: var(--space-6);
    backdrop-filter: blur(var(--glass-blur));
  }

  .showcase-item h3 {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-600);
    margin: 0 0 var(--space-4);
  }

  .streak-demo {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    align-items: center;
  }

  /* Button Grid */
  .button-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .variant-label {
    min-width: 140px;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-neutral-600);
  }

  /* Animation Demo */
  .animation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-4);
  }

  .animation-card {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-100);
    border: 2px solid var(--color-primary-300);
    border-radius: var(--radius-xl);
    font-weight: var(--font-semibold);
    color: var(--color-primary-700);
    cursor: pointer;
  }

  .animation-card.bounce:hover {
    animation: bounce-subtle 0.6s ease-in-out infinite alternate;
  }

  .animation-card.shake:hover {
    animation: shake 0.5s ease-in-out;
  }

  .animation-card.pulse:hover {
    animation: pulse-glow 1s ease-in-out infinite;
  }

  .animation-card.wiggle:hover {
    animation: wiggle 0.3s ease-in-out infinite;
  }

  @keyframes bounce-subtle {
    0% { transform: translateY(0); }
    100% { transform: translateY(-10px); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 var(--color-primary-400); }
    50% { box-shadow: 0 0 20px 8px var(--color-primary-300); }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }

  /* Dark mode adjustments */
  :global([data-theme="dark"]) .demo-title {
    color: var(--color-primary-400);
  }

  :global([data-theme="dark"]) .section-title {
    color: var(--color-neutral-100);
  }

  :global([data-theme="dark"]) .color-name {
    color: var(--color-neutral-200);
  }
</style>
