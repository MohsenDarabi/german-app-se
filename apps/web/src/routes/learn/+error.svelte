<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="error-page">
  <h1>Error {$page.status}</h1>
  <p>{$page.error?.message}</p>
  
  {#if import.meta.env.DEV}
    <pre>{JSON.stringify($page.error, null, 2)}</pre>
  {/if}
</div>

<style>
  .error-page {
    padding: 2rem;
    text-align: center;
    color: #ef4444;
  }
  pre {
    text-align: left;
    background: #f1f5f9;
    padding: 1rem;
    overflow: auto;
    margin-top: 1rem;
  }
</style>
