/**
 * Matching Pairs (Matchup) Extractor
 * Screen Type: ST-10
 * Selector: data-qa-ex="ex-matchup"
 *
 * See: docs/busuu-research/screen-types/ST-10-matching-pairs.md
 */

/**
 * Extract matching pairs exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractMatchup(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-matchup"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get questions (left side) - data-qa-type="answer"
    const questionEls = document.querySelectorAll('[data-qa-type="answer"]');
    const questions = Array.from(questionEls).map(el => ({
      text: el.querySelector('span')?.textContent?.trim() || '',
      pairId: el.getAttribute('data-qa-pass')
    }));

    // Get answers (right side) - data-qa-type="asset"
    const answerEls = document.querySelectorAll('[data-qa-type="asset"]');
    const answers = Array.from(answerEls).map(el => ({
      text: el.querySelector('span')?.textContent?.trim() || '',
      pairId: el.getAttribute('data-qa-pass')
    }));

    // Build pairs by matching data-qa-pass values
    const pairs = questions.map(q => {
      const matchingAnswer = answers.find(a => a.pairId === q.pairId);
      return {
        id: parseInt(q.pairId || '0', 10),
        question: q.text,
        answer: matchingAnswer?.text || ''
      };
    });

    return {
      type: 'matchup',
      instruction,
      pairs,
      // Provide shuffled lists for display
      questions: questions.map(q => q.text),
      answers: answers.map(a => a.text)
    };
  });
}

export default extractMatchup;
