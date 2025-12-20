<script lang="ts">
  import { dev } from '$app/environment';
  import { devMode } from '$lib/stores/devMode';
</script>

{#if dev}
  <div class="dev-toggle" dir="ltr">
    <button class="toggle-btn" class:active={$devMode} on:click={() => devMode.toggle()}>
      <span class="icon">🔧</span>
      <span class="label">Dev Mode</span>
      <span class="status" class:on={$devMode}>{$devMode ? 'ON' : 'OFF'}</span>
    </button>
  </div>
{/if}

<style>
  .dev-toggle {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    z-index: 9999;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #1e293b;
    color: #94a3b8;
    border: 2px solid #334155;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: monospace;
  }

  .toggle-btn:hover {
    background: #334155;
    color: #e2e8f0;
  }

  .toggle-btn.active {
    background: #065f46;
    border-color: #10b981;
    color: #a7f3d0;
  }

  .icon {
    font-size: 1rem;
  }

  .status {
    padding: 0.15rem 0.5rem;
    background: #475569;
    border-radius: 999px;
    font-size: 0.75rem;
  }

  .status.on {
    background: #10b981;
    color: #022c22;
  }
</style>
