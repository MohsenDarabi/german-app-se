<script lang="ts">
  import type { VerbGrammar } from "@pkg/content-model";

  export let word: string;
  export let translation: string;
  export let grammar: VerbGrammar;
</script>

<div class="verb-card">
  <div class="card-header">
    <span class="word">{grammar.infinitiv || word}</span>
    <span class="pos-badge">فعل (Verb)</span>
  </div>

  <p class="translation" dir="rtl">{translation}</p>

  {#if grammar.praesens}
    <div class="conjugation-section">
      <h4 class="section-title">زمان حال (Präsens)</h4>
      <table class="conjugation-table">
        <tbody>
          <tr>
            <td class="pronoun">ich</td>
            <td class="form">{grammar.praesens.ich}</td>
          </tr>
          <tr>
            <td class="pronoun">du</td>
            <td class="form">{grammar.praesens.du}</td>
          </tr>
          <tr>
            <td class="pronoun">er/sie/es</td>
            <td class="form">{grammar.praesens.er_sie_es}</td>
          </tr>
          <tr>
            <td class="pronoun">wir</td>
            <td class="form">{grammar.praesens.wir}</td>
          </tr>
          <tr>
            <td class="pronoun">ihr</td>
            <td class="form">{grammar.praesens.ihr}</td>
          </tr>
          <tr>
            <td class="pronoun">sie/Sie</td>
            <td class="form">{grammar.praesens.sie_Sie}</td>
          </tr>
        </tbody>
      </table>
    </div>
  {/if}

  {#if grammar.perfekt}
    <div class="perfekt-section">
      <h4 class="section-title">زمان گذشته (Perfekt)</h4>
      <div class="perfekt-formula">
        <span class="hilfsverb">{grammar.perfekt.hilfsverb}</span>
        <span class="plus">+</span>
        <span class="partizip">{grammar.perfekt.partizip}</span>
      </div>
      <p class="example">
        مثال: Ich <strong>{grammar.perfekt.hilfsverb}</strong> ... <strong>{grammar.perfekt.partizip}</strong>.
      </p>
    </div>
  {/if}
</div>

<style>
  .verb-card {
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    border: 2px solid #8b5cf6;
    border-radius: 1rem;
    padding: 1.25rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .word {
    font-size: 1.5rem;
    font-weight: 700;
    color: #5b21b6;
  }

  .pos-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: #8b5cf6;
    color: white;
    border-radius: 9999px;
    font-weight: 500;
  }

  .translation {
    font-size: 1rem;
    color: #6b7280;
    margin: 0 0 1rem 0;
  }

  .conjugation-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(139, 92, 246, 0.3);
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #5b21b6;
    margin: 0 0 0.75rem 0;
    text-align: right;
  }

  .conjugation-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .conjugation-table tr:nth-child(even) {
    background: rgba(139, 92, 246, 0.05);
  }

  .conjugation-table td {
    padding: 0.5rem;
  }

  .pronoun {
    text-align: left;
    font-weight: 500;
    color: #6b7280;
    width: 40%;
  }

  .form {
    text-align: left;
    font-weight: 600;
    color: #5b21b6;
  }

  .perfekt-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(139, 92, 246, 0.3);
  }

  .perfekt-formula {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .hilfsverb {
    font-weight: 600;
    color: #059669;
    padding: 0.25rem 0.5rem;
    background: #d1fae5;
    border-radius: 0.25rem;
  }

  .plus {
    color: #6b7280;
  }

  .partizip {
    font-weight: 600;
    color: #5b21b6;
    padding: 0.25rem 0.5rem;
    background: #ede9fe;
    border-radius: 0.25rem;
  }

  .example {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
    margin: 0;
  }

  .example strong {
    color: #5b21b6;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .verb-card {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
    border-color: #8b5cf6;
  }

  :global([data-theme="dark"]) .word { color: #c4b5fd; }
  :global([data-theme="dark"]) .translation { color: #a69b8a; }
  :global([data-theme="dark"]) .section-title { color: #c4b5fd; }
  :global([data-theme="dark"]) .pronoun { color: #a69b8a; }
  :global([data-theme="dark"]) .form { color: #c4b5fd; }

  :global([data-theme="dark"]) .perfekt-formula {
    background: #44403c;
  }

  :global([data-theme="dark"]) .hilfsverb {
    background: rgba(16, 185, 129, 0.2);
    color: #6ee7b7;
  }

  :global([data-theme="dark"]) .partizip {
    background: rgba(139, 92, 246, 0.2);
    color: #c4b5fd;
  }

  :global([data-theme="dark"]) .example { color: #a69b8a; }
  :global([data-theme="dark"]) .example strong { color: #c4b5fd; }
</style>
