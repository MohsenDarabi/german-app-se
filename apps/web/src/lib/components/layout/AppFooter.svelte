<footer class="footer" dir="rtl">
  <div class="footer-decoration"></div>

  <div class="footer-top">
    <div class="footer-col brand-col">
      <h3 class="brand-name">Deutschlern</h3>
      <p class="brand-desc">آموزش زبان آلمانی و انگلیسی برای فارسی‌زبان‌ها، با تمرکز بر جملات کاربردی و تمرین روزانه.</p>
      <div class="social-links">
        <span class="social-icon">📚</span>
        <span class="social-icon">🎯</span>
        <span class="social-icon">🌟</span>
      </div>
    </div>

    <div class="footer-col">
      <h4 class="col-title">بخش‌ها</h4>
      <nav class="footer-nav">
        <a href="/" class="footer-link">
          <span class="link-icon">🏠</span>
          <span>درس‌های اصلی</span>
        </a>
        <a href="/vocabulary" class="footer-link">
          <span class="link-icon">📖</span>
          <span>واژگان</span>
        </a>
        <a href="/practice" class="footer-link">
          <span class="link-icon">🎧</span>
          <span>تمرین شنیداری</span>
        </a>
        <a href="/progress" class="footer-link">
          <span class="link-icon">📊</span>
          <span>پیشرفت من</span>
        </a>
      </nav>
    </div>

    <div class="footer-col">
      <h4 class="col-title">کمک و پشتیبانی</h4>
      <nav class="footer-nav">
        <a href="/help" class="footer-link">
          <span class="link-icon">❓</span>
          <span>سوالات متداول</span>
        </a>
        <a href="/contact" class="footer-link">
          <span class="link-icon">✉️</span>
          <span>ارتباط با ما</span>
        </a>
      </nav>
    </div>
  </div>

  <div class="footer-bottom">
    <span class="copyright">© {new Date().getFullYear()} Deutschlern</span>
    <span class="separator">•</span>
    <span class="tagline">ساخته شده با <span class="heart">❤️</span> برای فارسی‌زبان‌های مهاجر</span>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    margin-top: var(--space-8, 2rem);
    padding: var(--space-8, 2rem) var(--space-6, 1.5rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-neutral-800, #292524) 0%, var(--color-neutral-900, #1c1917) 100%);
    color: var(--color-neutral-200, #e8e0d5);
    overflow: hidden;
  }

  .footer-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg,
      var(--color-primary-500, #0891b2) 0%,
      var(--color-xp-500, #4f46e5) 50%,
      var(--color-success-500, #eab308) 100%
    );
  }

  .footer-top {
    display: grid;
    grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
    gap: var(--space-8, 2rem);
    margin-bottom: var(--space-6, 1.5rem);
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .footer-col {
    text-align: right;
  }

  .brand-col {
    padding-left: var(--space-4, 1rem);
  }

  .brand-name {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-extrabold, 800);
    margin-bottom: var(--space-3, 0.75rem);
    background: linear-gradient(135deg, var(--color-primary-400, #22d3ee), var(--color-xp-400, #818cf8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-desc {
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.7;
    color: var(--color-neutral-400, #a69b8a);
    margin-bottom: var(--space-4, 1rem);
  }

  .social-links {
    display: flex;
    gap: var(--space-3, 0.75rem);
    justify-content: flex-end;
  }

  .social-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-700, #44403c);
    border-radius: var(--radius-lg, 0.75rem);
    font-size: 1rem;
    transition: all var(--transition-normal, 200ms);
    cursor: pointer;
  }

  .social-icon:hover {
    background: var(--color-primary-600, #0e7490);
    transform: translateY(-2px);
  }

  .col-title {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-100, #f5f0e8);
    margin-bottom: var(--space-4, 1rem);
    position: relative;
    display: inline-block;
  }

  .col-title::after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: 0;
    width: 24px;
    height: 2px;
    background: var(--color-primary-500, #0891b2);
    border-radius: var(--radius-full, 9999px);
  }

  .footer-nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .footer-link {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-400, #a69b8a);
    text-decoration: none;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-md, 0.5rem);
    transition: all var(--transition-normal, 200ms);
    justify-content: flex-end;
  }

  .footer-link:hover {
    color: var(--color-neutral-100, #f5f0e8);
    background: rgba(255, 255, 255, 0.05);
  }

  .link-icon {
    font-size: 0.9rem;
    opacity: 0.8;
    order: 1;
  }

  .footer-bottom {
    border-top: 1px solid var(--color-neutral-700, #44403c);
    padding-top: var(--space-4, 1rem);
    display: flex;
    gap: var(--space-3, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .copyright {
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-400, #a69b8a);
  }

  .separator {
    opacity: 0.5;
  }

  .tagline {
    display: flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
  }

  .heart {
    animation: heartbeat 1.5s ease-in-out infinite;
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* Responsive */
  @media (max-width: 720px) {
    .footer {
      padding: var(--space-6, 1.5rem) var(--space-4, 1rem);
    }

    .footer-top {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-6, 1.5rem);
    }

    .brand-col {
      padding-left: 0;
      text-align: center;
    }

    .brand-desc {
      text-align: center;
    }

    .social-links {
      justify-content: center;
    }

    .footer-col {
      text-align: center;
    }

    .col-title::after {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
    }

    .footer-link {
      justify-content: center;
    }

    .footer-bottom {
      flex-direction: column;
      align-items: center;
      gap: var(--space-2, 0.5rem);
    }

    .separator {
      display: none;
    }
  }

  /* Light mode override (footer stays dark) */
  :global([data-theme="light"]) .footer {
    background: linear-gradient(135deg, var(--color-neutral-800, #292524) 0%, var(--color-neutral-900, #1c1917) 100%);
  }
</style>

