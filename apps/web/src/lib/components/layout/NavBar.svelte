<script lang="ts">
    import LogoutButton from "../auth/LogoutButton.svelte";

  //import LogoutButton from '$lib/components/auth/LogoutButton.svelte'
  

  export let user: { email: string } | null = null
</script>

<header class="navbar">
  <div class="navbar-left">
    <a href="/" class="brand">
      <div class="brand-logo">DL</div>
      <div class="brand-text">
        <span class="brand-title">Deutschlern</span>
        <span class="brand-subtitle">آموزش آلمانی و انگلیسی برای فارسی‌زبان‌ها</span>
      </div>
    </a>

    {#if user}
      <nav class="nav-links">
        <a href="/">درس‌ها</a>
        <a href="/vocabulary">واژگان</a>
        <a href="/practice">تمرین‌ها</a>
        <a href="/progress">پیشرفت من</a>
      </nav>
    {/if}
  </div>

  <div class="navbar-right">
    <div class="language-switch">
      <button type="button">FA</button>
      <button type="button">DE</button>
      <button type="button">EN</button>
    </div>

    {#if user}
      <div class="user-info">
        <span class="user-email">{user.email}</span>
        <LogoutButton />
      </div>
    {:else}
      <a href="/login" class="login-link">ورود</a>
    {/if}
  </div>
</header>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1.5rem;
    background: linear-gradient(90deg, #1d61d1, #3b82f6);
    color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: inherit;
  }

  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.03em;
  }

  .brand-subtitle {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .nav-links {
    display: flex;
    gap: 0.75rem;
    font-size: 0.9rem;
  }

  .nav-links a {
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  .nav-links a:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .language-switch {
    display: flex;
    gap: 0.25rem;
    background: rgba(255, 255, 255, 0.12);
    padding: 0.1rem;
    border-radius: 999px;
  }

  .language-switch button {
    border: none;
    background: transparent;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    cursor: pointer;
  }

  .language-switch button:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-email {
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.12);
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  .login-link {
    color: #fff;
    text-decoration: none;
    padding: 0.3rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
  }

  .login-link:hover {
    background: rgba(255, 255, 255, 0.16);
  }

  @media (max-width: 720px) {
    .nav-links {
      display: none;
    }

    .brand-subtitle {
      display: none;
    }

    .navbar {
      padding-inline: 1rem;
    }
  }
</style>

