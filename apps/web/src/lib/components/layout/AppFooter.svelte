<footer class="footer">
  <div class="footer-top">
    <div class="footer-col">
      <h3>Deutschlern</h3>
      <p>آموزش زبان آلمانی و انگلیسی برای فارسی‌زبان‌ها، با تمرکز بر جملات کاربردی و تمرین روزانه.</p>
    </div>

    <div class="footer-col">
      <h4>بخش‌ها</h4>
      <a href="/">درس‌های اصلی</a>
      <a href="/vocabulary">واژگان</a>
      <a href="/practice">تمرین شنیداری</a>
      <a href="/progress">پیشرفت من</a>
    </div>

    <div class="footer-col">
      <h4>کمک و پشتیبانی</h4>
      <a href="/help">سوالات متداول</a>
      <a href="/contact">ارتباط با ما</a>
    </div>
  </div>

  <div class="footer-bottom">
    <span>© {new Date().getFullYear()} Deutschlern</span>
    <span class="separator">•</span>
    <span>ساخته شده برای فارسی‌زبان‌های مهاجر</span>
  </div>
</footer>

<style>
  .footer {
    margin-top: 3rem;
    padding: 2rem 1.5rem 1.5rem;
    background: #0f172a;
    color: #e5e7eb;
  }

  .footer-top {
    display: grid;
    grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .footer-col h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .footer-col h4 {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }

  .footer-col p {
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .footer-col a {
    display: block;
    font-size: 0.85rem;
    color: #cbd5f5;
    text-decoration: none;
    margin-bottom: 0.25rem;
  }

  .footer-col a:hover {
    color: #fff;
  }

  .footer-bottom {
    border-top: 1px solid rgba(148, 163, 184, 0.4);
    padding-top: 0.75rem;
    display: flex;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: #9ca3af;
    flex-wrap: wrap;
  }

  .separator {
    opacity: 0.8;
  }

  @media (max-width: 720px) {
    .footer-top {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>

