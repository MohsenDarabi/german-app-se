<script lang="ts">
  import { playGerman, stopAudio } from '$lib/utils/audio';

  export let text: string;
  export let lessonId: string | undefined = undefined;
  export let audioId: string | undefined = undefined;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  let isPlaying = false;

  async function handleClick() {
    if (isPlaying) {
      stopAudio();
      isPlaying = false;
      return;
    }

    isPlaying = true;
    try {
      await playGerman(text, lessonId, audioId);
    } finally {
      isPlaying = false;
    }
  }
</script>

<button
  class="audio-btn {size}"
  class:playing={isPlaying}
  on:click={handleClick}
  title={isPlaying ? 'توقف' : 'پخش صدا'}
  aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
>
  {#if isPlaying}
    <span class="icon">⏹️</span>
  {:else}
    <span class="icon">🔊</span>
  {/if}
</button>

<style>
  .audio-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: #eff6ff;
    color: #3b82f6;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .audio-btn:hover {
    background: #dbeafe;
    transform: scale(1.1);
  }

  .audio-btn:active {
    transform: scale(0.95);
  }

  .audio-btn.playing {
    background: #fef3c7;
    color: #d97706;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* Sizes */
  .sm {
    width: 2rem;
    height: 2rem;
    font-size: 0.9rem;
  }

  .md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.1rem;
  }

  .lg {
    width: 3rem;
    height: 3rem;
    font-size: 1.3rem;
  }

  .icon {
    line-height: 1;
  }
</style>
