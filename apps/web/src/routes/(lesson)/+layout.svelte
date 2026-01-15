<script lang="ts">
  /**
   * Immersive Lesson Layout
   * Full-screen mode without navigation (like Duolingo/Busuu)
   * Navigation is hidden for maximum focus and space
   */
</script>

<div class="lesson-shell">
  <slot />
</div>

<style>
  /*
   * Immersive Lesson Shell
   * Full viewport height, no navigation distractions
   * Mobile-first responsive design
   */
  .lesson-shell {
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(
      circle at top,
      var(--color-primary-50) 0%,
      var(--color-neutral-50) 40%,
      var(--color-neutral-100) 100%
    );
    color: var(--color-neutral-800);
    overflow: hidden;
    width: 100%;
    position: relative;
  }

  /* Dark mode */
  :global([data-theme="dark"]) .lesson-shell {
    background: radial-gradient(
      circle at top,
      var(--color-neutral-100) 0%,
      var(--color-neutral-50) 100%
    );
  }

  /* Tablet: centered with subtle border */
  @media (min-width: 768px) {
    .lesson-shell {
      max-width: 600px;
      margin: 0 auto;
      border-left: 1px solid var(--color-neutral-200);
      border-right: 1px solid var(--color-neutral-200);
    }

    :global([data-theme="dark"]) .lesson-shell {
      border-color: var(--color-neutral-100);
    }
  }

  /* Desktop: contained with margin */
  @media (min-width: 1024px) {
    .lesson-shell {
      max-width: 700px;
      height: calc(100dvh - var(--space-8, 2rem));
      margin: var(--space-4, 1rem) auto;
      border-radius: var(--radius-2xl, 1.5rem);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }
  }
</style>
