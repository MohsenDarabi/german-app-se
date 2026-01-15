<script lang="ts">
  // Impressum page - legal requirement for German websites
</script>

<div class="impressum-page">
  <h1>Impressum</h1>

  <section class="section">
    <h2>Angaben gemäß § 5 TMG</h2>
    <p>
      [Name]<br>
      [Straße und Hausnummer]<br>
      [PLZ und Ort]<br>
      Deutschland
    </p>
  </section>

  <section class="section">
    <h2>Kontakt</h2>
    <p>
      E-Mail: [email@example.com]
    </p>
  </section>

  <section class="section">
    <h2>Haftungsausschluss</h2>
    <h3>Haftung für Inhalte</h3>
    <p>
      Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
      Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
    </p>

    <h3>Haftung für Links</h3>
    <p>
      Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
      Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
    </p>
  </section>

  <section class="section">
    <h2>Datenschutz</h2>
    <p>
      Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich.
      Soweit auf unseren Seiten personenbezogene Daten erhoben werden, erfolgt dies stets auf
      freiwilliger Basis.
    </p>
  </section>
</div>

<style>
  .impressum-page {
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-6, 1.5rem);
  }

  h1 {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-6, 1.5rem);
  }

  .section {
    margin-bottom: var(--space-6, 1.5rem);
  }

  h2 {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-700, #44403c);
    margin-bottom: var(--space-3, 0.75rem);
  }

  h3 {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-600, #57534e);
    margin-top: var(--space-4, 1rem);
    margin-bottom: var(--space-2, 0.5rem);
  }

  p {
    font-size: var(--text-base, 1rem);
    line-height: 1.7;
    color: var(--color-neutral-600, #57534e);
  }

  :global([data-theme="dark"]) h1 {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) h2 {
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) h3 {
    color: var(--color-neutral-300, #d4c9b9);
  }

  :global([data-theme="dark"]) p {
    color: var(--color-neutral-400, #a69b8a);
  }
</style>
