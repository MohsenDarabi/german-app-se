<footer class="footer">
  <div class="footer-content">
    <span class="brand">Deutschlern</span>
    <span class="separator">·</span>
    <span class="copyright">© {new Date().getFullYear()}</span>
    <span class="separator">·</span>
    <a href="/impressum" class="footer-link">Impressum</a>
    <span class="separator">·</span>
    <span class="tagline" dir="rtl">برای فارسی‌زبانان</span>
  </div>
</footer>

<style>
  .footer {
    margin-top: auto;
    padding: var(--space-4, 1rem) var(--space-6, 1.5rem);
    background: var(--color-neutral-800, #292524);
    border-top: 1px solid var(--color-neutral-700, #44403c);
  }

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-400, #a69b8a);
    flex-wrap: wrap;
  }

  .brand {
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-300, #d4c9b9);
  }

  .separator {
    opacity: 0.4;
  }

  .copyright {
    color: var(--color-neutral-500, #78716c);
  }

  .tagline {
    color: var(--color-neutral-500, #78716c);
  }

  .footer-link {
    color: var(--color-neutral-400, #a69b8a);
    text-decoration: none;
    transition: color 150ms;
  }

  .footer-link:hover {
    color: var(--color-neutral-200, #e8e0d5);
  }

  @media (max-width: 480px) {
    .footer-content {
      gap: var(--space-2, 0.5rem);
    }

    .separator:last-of-type,
    .tagline {
      display: none;
    }
  }
</style>
