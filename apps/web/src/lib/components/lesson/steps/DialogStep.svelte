<script lang="ts">
  import type { DialogStep } from "$lib/content-model";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: DialogStep;
  export let lessonId: string = '';
</script>

<div class="step-container">
  <h2 class="step-title">مکالمه</h2>
  <div class="chat-box">
    {#each step.lines as line, i (i)}
      <div class="chat-bubble">
        <div class="bubble-header">
          <span class="speaker-name">{line.speaker}</span>
          <AudioButton
            text={line.text.de}
            {lessonId}
            audioId="{step.id}-line{i}"
            size="sm"
          />
        </div>
        <p class="dialog-text">{line.text.de}</p>
        <p class="dialog-translation" dir="rtl"><BiDiText text={line.text.fa} /></p>
      </div>
    {/each}
  </div>
</div>

<style>
  /* Mobile-first styles */
  .step-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .step-title {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-1, 0.25rem);
    text-align: center;
    background: linear-gradient(135deg, var(--color-primary-600, #0e7490), var(--color-xp-600, #4338ca));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .chat-bubble {
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    padding: var(--space-3, 0.75rem);
    border-radius: var(--radius-lg, 0.75rem);
    border-bottom-left-radius: var(--radius-sm, 0.375rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    /* Full width on mobile for better readability */
    max-width: 100%;
    color: var(--color-neutral-700, #44403c);
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.5;
    transition: all var(--transition-normal, 200ms);
  }

  .chat-bubble:hover {
    transform: translateX(4px);
    border-color: var(--color-primary-300, #67e8f9);
  }

  .chat-bubble:nth-child(even) {
    border-bottom-left-radius: var(--radius-lg, 0.75rem);
    border-bottom-right-radius: var(--radius-sm, 0.375rem);
    background: linear-gradient(135deg, var(--color-primary-50, #ecfeff), rgba(8, 145, 178, 0.05));
  }

  .chat-bubble:nth-child(even):hover {
    transform: translateX(-4px);
  }

  .bubble-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2, 0.5rem);
    gap: var(--space-2, 0.5rem);
  }

  .speaker-name {
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-700, #155e75);
    font-size: var(--text-sm, 0.875rem);
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    background: var(--color-primary-100, #cffafe);
    border-radius: var(--radius-full, 9999px);
  }

  .chat-bubble:nth-child(even) .speaker-name {
    color: var(--color-xp-700, #3730a3);
    background: var(--color-xp-100, #e0e7ff);
  }

  .dialog-text {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-1, 0.25rem);
    word-wrap: break-word;
    font-weight: var(--font-medium, 500);
  }

  .dialog-translation {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    font-style: italic;
    word-wrap: break-word;
  }

  /* Larger screens */
  @media (min-width: 480px) {
    .step-container {
      gap: var(--space-4, 1rem);
    }

    .step-title {
      font-size: var(--text-xl, 1.25rem);
      margin-bottom: var(--space-2, 0.5rem);
    }

    .chat-box {
      gap: var(--space-3, 0.75rem);
    }

    .chat-bubble {
      padding: var(--space-4, 1rem);
      border-radius: var(--radius-xl, 1rem);
      max-width: 85%;
    }

    .chat-bubble:nth-child(even) {
      margin-left: auto;
    }

    .speaker-name {
      font-size: var(--text-sm, 0.875rem);
    }

    .dialog-text {
      font-size: var(--text-base, 1rem);
    }

    .dialog-translation {
      font-size: var(--text-sm, 0.875rem);
    }
  }

  /* Dark Mode - use hardcoded colors since CSS variables swap */
  :global([data-theme="dark"]) .step-title {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .chat-bubble {
    background: #44403c;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .chat-bubble:nth-child(even) {
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.25), rgba(8, 145, 178, 0.15));
  }

  :global([data-theme="dark"]) .dialog-text {
    color: #f5f0e8;
    font-weight: 500;
  }

  :global([data-theme="dark"]) .dialog-translation {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .speaker-name {
    background: rgba(8, 145, 178, 0.3);
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .chat-bubble:nth-child(even) .speaker-name {
    background: rgba(79, 70, 229, 0.3);
    color: #a5b4fc;
  }
</style>
