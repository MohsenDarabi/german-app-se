<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(() => {
    console.error('[ErrorPage] Error details:', {
      status: $page.status,
      error: $page.error,
      message: $page.error?.message,
      stack: ($page.error as any)?.stack
    });
  });
</script>

<div class="error-container">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message || 'An error occurred'}</p>
  <pre class="error-details">{JSON.stringify($page.error, null, 2)}</pre>
  <a href="/" class="home-link">Back to Home</a>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 2rem;
  }

  h1 {
    font-size: 4rem;
    color: #1e40af;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.25rem;
    color: #64748b;
    margin-bottom: 2rem;
  }

  .home-link {
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 500;
  }

  .home-link:hover {
    background: #1d4ed8;
  }

  .error-details {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: left;
    max-width: 90%;
    overflow: auto;
    font-size: 0.75rem;
    margin-bottom: 1rem;
  }
</style>
