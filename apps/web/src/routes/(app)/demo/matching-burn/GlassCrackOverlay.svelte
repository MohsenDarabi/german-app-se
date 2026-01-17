<script lang="ts">
  export let active = false;
  export let onComplete: () => void = () => {};

  // Trigger completion callback after animation
  $: if (active) {
    setTimeout(onComplete, 800);
  }
</script>

{#if active}
  <div class="crack-overlay">
    <!-- Main crack lines radiating from center -->
    <svg class="crack-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <!-- Central impact point -->
      <circle cx="50" cy="50" r="3" class="impact-point" />

      <!-- Primary cracks radiating outward -->
      <path class="crack-line crack-1" d="M50,50 L20,15" />
      <path class="crack-line crack-2" d="M50,50 L80,20" />
      <path class="crack-line crack-3" d="M50,50 L85,55" />
      <path class="crack-line crack-4" d="M50,50 L75,85" />
      <path class="crack-line crack-5" d="M50,50 L30,80" />
      <path class="crack-line crack-6" d="M50,50 L10,45" />

      <!-- Secondary branches -->
      <path class="crack-line crack-branch-1" d="M35,32 L25,25" />
      <path class="crack-line crack-branch-2" d="M65,35 L70,28" />
      <path class="crack-line crack-branch-3" d="M68,52 L78,48" />
      <path class="crack-line crack-branch-4" d="M62,68 L68,75" />
      <path class="crack-line crack-branch-5" d="M40,65 L35,72" />
      <path class="crack-line crack-branch-6" d="M30,47 L22,42" />

      <!-- Tertiary small cracks -->
      <path class="crack-line crack-small-1" d="M28,28 L22,32" />
      <path class="crack-line crack-small-2" d="M72,25 L78,30" />
      <path class="crack-line crack-small-3" d="M80,60 L88,58" />
      <path class="crack-line crack-small-4" d="M70,78 L75,82" />
      <path class="crack-line crack-small-5" d="M32,75 L28,80" />
      <path class="crack-line crack-small-6" d="M18,50 L12,52" />
    </svg>

    <!-- Glass shards/fragments effect -->
    <div class="shards">
      <div class="shard shard-1"></div>
      <div class="shard shard-2"></div>
      <div class="shard shard-3"></div>
      <div class="shard shard-4"></div>
      <div class="shard shard-5"></div>
      <div class="shard shard-6"></div>
    </div>
  </div>
{/if}

<style>
  .crack-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
    overflow: hidden;
    border-radius: inherit;
  }

  .crack-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .impact-point {
    fill: rgba(255, 255, 255, 0.9);
    opacity: 0;
    animation: impact-flash 0.15s ease-out forwards;
  }

  @keyframes impact-flash {
    0% {
      opacity: 0;
      r: 1;
    }
    50% {
      opacity: 1;
      r: 5;
    }
    100% {
      opacity: 0.3;
      r: 3;
    }
  }

  .crack-line {
    fill: none;
    stroke: rgba(255, 255, 255, 0.85);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
  }

  /* Primary cracks - fastest */
  .crack-1 { animation: crack-spread 0.25s ease-out 0.05s forwards; }
  .crack-2 { animation: crack-spread 0.25s ease-out 0.08s forwards; }
  .crack-3 { animation: crack-spread 0.25s ease-out 0.06s forwards; }
  .crack-4 { animation: crack-spread 0.25s ease-out 0.1s forwards; }
  .crack-5 { animation: crack-spread 0.25s ease-out 0.07s forwards; }
  .crack-6 { animation: crack-spread 0.25s ease-out 0.09s forwards; }

  /* Branch cracks - medium delay */
  .crack-branch-1 { animation: crack-spread 0.2s ease-out 0.2s forwards; stroke-width: 1.2; }
  .crack-branch-2 { animation: crack-spread 0.2s ease-out 0.22s forwards; stroke-width: 1.2; }
  .crack-branch-3 { animation: crack-spread 0.2s ease-out 0.21s forwards; stroke-width: 1.2; }
  .crack-branch-4 { animation: crack-spread 0.2s ease-out 0.24s forwards; stroke-width: 1.2; }
  .crack-branch-5 { animation: crack-spread 0.2s ease-out 0.23s forwards; stroke-width: 1.2; }
  .crack-branch-6 { animation: crack-spread 0.2s ease-out 0.25s forwards; stroke-width: 1.2; }

  /* Small cracks - longest delay */
  .crack-small-1 { animation: crack-spread 0.15s ease-out 0.32s forwards; stroke-width: 0.8; }
  .crack-small-2 { animation: crack-spread 0.15s ease-out 0.34s forwards; stroke-width: 0.8; }
  .crack-small-3 { animation: crack-spread 0.15s ease-out 0.33s forwards; stroke-width: 0.8; }
  .crack-small-4 { animation: crack-spread 0.15s ease-out 0.36s forwards; stroke-width: 0.8; }
  .crack-small-5 { animation: crack-spread 0.15s ease-out 0.35s forwards; stroke-width: 0.8; }
  .crack-small-6 { animation: crack-spread 0.15s ease-out 0.37s forwards; stroke-width: 0.8; }

  @keyframes crack-spread {
    0% {
      stroke-dashoffset: 100;
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  /* Glass shards */
  .shards {
    position: absolute;
    inset: 0;
  }

  .shard {
    position: absolute;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.3) 100%
    );
    opacity: 0;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .shard-1 {
    top: 10%;
    left: 15%;
    width: 20%;
    height: 25%;
    animation: shard-appear 0.3s ease-out 0.4s forwards;
  }

  .shard-2 {
    top: 5%;
    right: 20%;
    width: 18%;
    height: 22%;
    animation: shard-appear 0.3s ease-out 0.45s forwards;
  }

  .shard-3 {
    top: 40%;
    right: 5%;
    width: 22%;
    height: 28%;
    animation: shard-appear 0.3s ease-out 0.42s forwards;
  }

  .shard-4 {
    bottom: 10%;
    right: 25%;
    width: 16%;
    height: 20%;
    animation: shard-appear 0.3s ease-out 0.48s forwards;
  }

  .shard-5 {
    bottom: 15%;
    left: 20%;
    width: 19%;
    height: 24%;
    animation: shard-appear 0.3s ease-out 0.44s forwards;
  }

  .shard-6 {
    top: 35%;
    left: 5%;
    width: 15%;
    height: 18%;
    animation: shard-appear 0.3s ease-out 0.46s forwards;
  }

  @keyframes shard-appear {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
    100% {
      opacity: 0.3;
      transform: scale(1);
    }
  }

  /* Dark mode adjustments */
  :global([data-theme="dark"]) .crack-line {
    stroke: rgba(255, 255, 255, 0.9);
  }

  :global([data-theme="dark"]) .impact-point {
    fill: rgba(255, 255, 255, 1);
  }
</style>
