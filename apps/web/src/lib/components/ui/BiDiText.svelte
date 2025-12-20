<script lang="ts">
  /**
   * BiDiText - Handles bidirectional text (mixed RTL/LTR) properly
   *
   * This component detects the first "strong" directional character in the text
   * and sets the base direction accordingly. This mimics how the Chrome extension
   * "Auto RTL/LTR Switcher" works.
   *
   * - If text starts with RTL characters (Persian, Arabic, Hebrew) → dir="rtl"
   * - If text starts with LTR characters (Latin, etc.) → dir="ltr"
   * - The browser's Unicode Bidi algorithm handles embedded opposite-direction text
   */
  import { detectDirection } from '$lib/utils/bidi';

  export let text: string;
  export let tag: 'span' | 'p' | 'div' = 'span';

  $: detectedDir = detectDirection(text);
</script>

{#if tag === 'p'}
  <p dir={detectedDir} class="bidi-text">{text}</p>
{:else if tag === 'div'}
  <div dir={detectedDir} class="bidi-text">{text}</div>
{:else}
  <span dir={detectedDir} class="bidi-text">{text}</span>
{/if}

<style>
  .bidi-text {
    unicode-bidi: isolate;
  }
</style>
