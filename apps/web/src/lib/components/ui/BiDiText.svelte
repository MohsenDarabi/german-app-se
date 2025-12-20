<script lang="ts">
  /**
   * BiDiText - Handles bidirectional text (mixed RTL/LTR) properly
   *
   * This component automatically wraps Latin/German text segments in LTR spans
   * when displayed within an RTL (Persian/Farsi) context, preventing word order issues.
   */
  export let text: string;
  export let dir: 'rtl' | 'ltr' | 'auto' = 'auto';
  export let tag: 'span' | 'p' | 'div' = 'span';

  // Regex to match Latin text (including German umlauts and ß)
  const latinRegex = /([A-Za-zÄäÖöÜüß][A-Za-zÄäÖöÜüß0-9\s\-'.,!?;:()]*[A-Za-zÄäÖöÜüß0-9.!?])|([A-Za-zÄäÖöÜüß])/g;

  // Process text to wrap Latin segments in LTR spans
  function processText(input: string): string {
    if (!input) return '';

    // Replace Latin segments with LTR-wrapped versions
    return input.replace(latinRegex, '<span dir="ltr" class="bidi-ltr">$&</span>');
  }

  $: processedText = processText(text);
</script>

{#if tag === 'p'}
  <p {dir} class="bidi-text" {@html processedText}></p>
{:else if tag === 'div'}
  <div {dir} class="bidi-text" {@html processedText}></div>
{:else}
  <span {dir} class="bidi-text" {@html processedText}></span>
{/if}

<style>
  .bidi-text {
    unicode-bidi: isolate;
  }

  :global(.bidi-ltr) {
    direction: ltr;
    unicode-bidi: isolate;
    display: inline;
  }
</style>
