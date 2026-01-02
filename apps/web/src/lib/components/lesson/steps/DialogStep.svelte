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
    gap: 0.75rem;
  }

  .step-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
    text-align: center;
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .chat-bubble {
    background-color: #f1f5f9;
    padding: 0.625rem 0.75rem;
    border-radius: 0.75rem;
    border-bottom-left-radius: 0.25rem;
    /* Full width on mobile for better readability */
    max-width: 100%;
    color: #334155;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .bubble-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    gap: 0.5rem;
  }

  .speaker-name {
    font-weight: 700;
    color: #1e40af;
    font-size: 0.85rem;
  }

  .dialog-text {
    font-size: 0.9rem;
    color: #1e293b;
    margin-bottom: 0.25rem;
    word-wrap: break-word;
  }

  .dialog-translation {
    font-size: 0.85rem;
    color: #64748b;
    font-style: italic;
    word-wrap: break-word;
  }

  /* Larger screens */
  @media (min-width: 480px) {
    .step-container {
      gap: 1rem;
    }

    .step-title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .chat-box {
      gap: 0.75rem;
    }

    .chat-bubble {
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      max-width: 85%;
      font-size: 1rem;
      line-height: 1.5;
    }

    .speaker-name {
      font-size: 0.9rem;
    }

    .dialog-text {
      font-size: 1rem;
    }

    .dialog-translation {
      font-size: 0.9rem;
    }
  }
</style>
