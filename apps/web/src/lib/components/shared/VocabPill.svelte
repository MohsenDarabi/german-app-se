<script lang="ts">
  /**
   * Reusable component for displaying German-Persian word pairs
   * Used throughout the app for vocabulary, grammar notes, and exercises
   */
  export let german: string = '';
  export let persian: string = '';
  export let number: string | number = '';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let variant: 'default' | 'primary' | 'success' | 'warning' = 'default';
</script>

<div class="vocab-pill {size} {variant}" dir="ltr">
  <div class="pill-content">
    {#if number}
      <span class="number">{number}</span>
    {/if}
    <span class="german">{german}</span>
    {#if persian}
      <span class="persian" dir="rtl">{persian}</span>
    {/if}
  </div>
</div>

<style>
  .vocab-pill {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;
    min-width: 80px;
    gap: 0.25rem;
  }

  .vocab-pill:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
  }

  .pill-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
  }

  /* Size Variants */
  .vocab-pill.small {
    padding: 0.5rem 0.75rem;
    min-width: 60px;
  }

  .vocab-pill.medium {
    padding: 0.75rem 1rem;
    min-width: 80px;
  }

  .vocab-pill.large {
    padding: 1rem 1.25rem;
    min-width: 100px;
  }

  /* Color Variants */
  .vocab-pill.default {
    background: white;
    border-color: #e2e8f0;
  }

  .vocab-pill.default:hover {
    border-color: #3b82f6;
  }

  .vocab-pill.primary {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-color: #3b82f6;
  }

  .vocab-pill.primary:hover {
    border-color: #2563eb;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  }

  .vocab-pill.success {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-color: #22c55e;
  }

  .vocab-pill.success:hover {
    border-color: #16a34a;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
  }

  .vocab-pill.warning {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-color: #fbbf24;
  }

  .vocab-pill.warning:hover {
    border-color: #f59e0b;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
  }

  /* Text Elements */
  .number {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    line-height: 1;
  }

  .small .number {
    font-size: 0.7rem;
  }

  .large .number {
    font-size: 0.85rem;
  }

  .german {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
    text-align: center;
  }

  .small .german {
    font-size: 0.95rem;
  }

  .large .german {
    font-size: 1.25rem;
  }

  .persian {
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    line-height: 1;
    text-align: center;
    font-family: 'Vazirmatn', sans-serif;
  }

  .small .persian {
    font-size: 0.75rem;
  }

  .large .persian {
    font-size: 0.95rem;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .vocab-pill {
      min-width: 70px;
    }

    .vocab-pill.small {
      min-width: 55px;
    }

    .vocab-pill.large {
      min-width: 85px;
    }
  }
</style>
