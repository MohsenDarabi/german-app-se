<script lang="ts">
  import type { NounGrammar } from "@pkg/content-model";

  export let word: string;
  export let translation: string;
  export let grammar: NounGrammar;

  const ARTIKEL_LABELS = {
    m: { article: 'der', name: 'مذکر (Maskulin)', color: 'masculine' },
    f: { article: 'die', name: 'مونث (Feminin)', color: 'feminine' },
    n: { article: 'das', name: 'خنثی (Neutrum)', color: 'neuter' },
  };

  $: artikelInfo = ARTIKEL_LABELS[grammar.artikel];
</script>

<div class="noun-card" class:masculine={artikelInfo.color === 'masculine'} class:feminine={artikelInfo.color === 'feminine'} class:neuter={artikelInfo.color === 'neuter'}>
  <div class="card-header">
    <div class="word-display">
      <span class="article">{artikelInfo.article}</span>
      <span class="word">{word}</span>
    </div>
    <span class="gender-badge">{artikelInfo.name}</span>
  </div>

  <p class="translation" dir="rtl">{translation}</p>

  {#if grammar.plural}
    <div class="plural-section">
      <span class="label">جمع:</span>
      <span class="value">die {grammar.plural}</span>
    </div>
  {/if}

  {#if grammar.cases}
    <div class="cases-section">
      <h4 class="section-title">صرف بر اساس حالت (Kasus)</h4>
      <table class="cases-table">
        <thead>
          <tr>
            <th>حالت</th>
            <th>مفرد</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="case-name">Nominativ</td>
            <td class="case-value">{grammar.cases.nominativ}</td>
          </tr>
          <tr>
            <td class="case-name">Akkusativ</td>
            <td class="case-value">{grammar.cases.akkusativ}</td>
          </tr>
          <tr>
            <td class="case-name">Dativ</td>
            <td class="case-value">{grammar.cases.dativ}</td>
          </tr>
          <tr>
            <td class="case-name">Genitiv</td>
            <td class="case-value">{grammar.cases.genitiv}</td>
          </tr>
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .noun-card {
    background: white;
    border-radius: 1rem;
    padding: 1.25rem;
    border: 2px solid #e5e7eb;
  }

  .noun-card.masculine {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
  }

  .noun-card.feminine {
    border-color: #ec4899;
    background: linear-gradient(135deg, #fdf2f8, #fce7f3);
  }

  .noun-card.neuter {
    border-color: #10b981;
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .word-display {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .article {
    font-size: 1rem;
    font-weight: 500;
    opacity: 0.8;
  }

  .word {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .masculine .word { color: #1e40af; }
  .feminine .word { color: #9d174d; }
  .neuter .word { color: #047857; }

  .gender-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-weight: 500;
  }

  .masculine .gender-badge {
    background: #3b82f6;
    color: white;
  }

  .feminine .gender-badge {
    background: #ec4899;
    color: white;
  }

  .neuter .gender-badge {
    background: #10b981;
    color: white;
  }

  .translation {
    font-size: 1rem;
    color: #6b7280;
    margin: 0 0 1rem 0;
  }

  .plural-section {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-top: 1px dashed #d1d5db;
  }

  .label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .value {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .cases-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem 0;
    text-align: right;
  }

  .cases-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .cases-table th {
    text-align: right;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    font-weight: 600;
    color: #374151;
  }

  .cases-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .case-name {
    text-align: right;
    font-weight: 500;
    color: #6b7280;
  }

  .case-value {
    text-align: left;
    font-weight: 600;
  }

  .masculine .case-value { color: #1e40af; }
  .feminine .case-value { color: #9d174d; }
  .neuter .case-value { color: #047857; }

  /* Dark Mode */
  :global([data-theme="dark"]) .noun-card {
    background: #292524;
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .noun-card.masculine {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
    border-color: #3b82f6;
  }

  :global([data-theme="dark"]) .noun-card.feminine {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05));
    border-color: #ec4899;
  }

  :global([data-theme="dark"]) .noun-card.neuter {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border-color: #10b981;
  }

  :global([data-theme="dark"]) .masculine .word { color: #93c5fd; }
  :global([data-theme="dark"]) .feminine .word { color: #f9a8d4; }
  :global([data-theme="dark"]) .neuter .word { color: #6ee7b7; }

  :global([data-theme="dark"]) .translation { color: #a69b8a; }

  :global([data-theme="dark"]) .section-title,
  :global([data-theme="dark"]) .cases-table th { color: #f5f0e8; }

  :global([data-theme="dark"]) .label,
  :global([data-theme="dark"]) .case-name { color: #a69b8a; }

  :global([data-theme="dark"]) .cases-table th { background: rgba(255, 255, 255, 0.05); }
  :global([data-theme="dark"]) .cases-table td { border-color: #44403c; }

  :global([data-theme="dark"]) .masculine .case-value { color: #93c5fd; }
  :global([data-theme="dark"]) .feminine .case-value { color: #f9a8d4; }
  :global([data-theme="dark"]) .neuter .case-value { color: #6ee7b7; }
</style>
