<script lang="ts">
  import type { DialogStep } from "$lib/content-model";
  import { playText } from "$lib/utils/audio";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";

  export let step: DialogStep;

  function playLineAudio(line: any) {
    if (line.audio?.url) {
      // TODO: Play actual audio file when available
      console.log("Playing audio:", line.audio.url);
    } else {
      // Fallback to TTS
      playText(line.text.de, 'de-DE');
    }
  }
</script>

<div class="step-container">
  <h2 class="step-title">مکالمه</h2>
  <div class="chat-box">
    {#each step.lines as line, i (i)}
      <div class="chat-bubble">
        <div class="speaker-name">{line.speaker}</div>
        <p class="dialog-text">{line.text.de}</p>
        <p class="dialog-translation" dir="rtl"><BiDiText text={line.text.fa} /></p>
        <button class="audio-btn-small" on:click={() => playLineAudio(line)} aria-label="Play audio">
          🔊
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .step-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .step-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  .chat-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .chat-bubble {
    position: relative;
    background-color: #f1f5f9;
    padding: 0.75rem 1rem;
    padding-right: 3rem;
    border-radius: 1rem;
    border-bottom-left-radius: 0.25rem;
    max-width: 85%;
    color: #334155;
    font-size: 1rem;
    line-height: 1.5;
  }
  .speaker-name {
    font-weight: 700;
    color: #1e40af;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  .dialog-text {
    font-size: 1rem;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }
  .dialog-translation {
    font-size: 0.9rem;
    color: #64748b;
    font-style: italic;
  }
  .audio-btn-small {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: #e0f2fe;
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    transition: background 0.2s;
  }
  .audio-btn-small:hover {
    background: #bae6fd;
  }
</style>
