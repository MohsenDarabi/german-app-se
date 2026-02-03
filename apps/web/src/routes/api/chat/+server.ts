import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt for German tutor for Persian speakers
const SYSTEM_PROMPT = `تو یک معلم آلمانی هستی که به فارسی‌زبانان کمک می‌کنی. پاسخ‌هایت باید:

1. به فارسی باشند (با مثال‌های آلمانی)
2. کوتاه و مفید باشند (حداکثر ۳-۴ جمله)
3. نکات گرامری را ساده توضیح دهی
4. برای مبتدیان A1/A2 مناسب باشند

مثال‌ها:
- اگر سوال درباره حرف تعریف باشد: جنسیت اسم را توضیح بده (der/die/das)
- اگر سوال درباره فعل باشد: صرف ساده را نشان بده
- اگر سوال درباره جمله باشد: ترتیب کلمات را توضیح بده

همیشه یک مثال آلمانی با ترجمه فارسی بده.`;

interface ChatRequest {
  message: string;
  lessonContext?: string;
  vocabulary?: Array<{ de: string; fa: string }>;
}

export const POST: RequestHandler = async ({ request }) => {
  // Check if API key is configured
  if (!env.GROQ_API_KEY) {
    return json(
      { error: 'AI chat is not configured. Please add GROQ_API_KEY to environment variables.' },
      { status: 503 }
    );
  }

  try {
    const body: ChatRequest = await request.json();
    const { message, lessonContext, vocabulary } = body;

    if (!message || typeof message !== 'string') {
      return json({ error: 'Message is required' }, { status: 400 });
    }

    // Limit message length
    if (message.length > 500) {
      return json({ error: 'Message too long. Maximum 500 characters.' }, { status: 400 });
    }

    // Build context with lesson vocabulary if available
    let contextPrompt = SYSTEM_PROMPT;
    if (vocabulary && vocabulary.length > 0) {
      const vocabList = vocabulary
        .slice(0, 10) // Limit to 10 words for context
        .map(v => `${v.de} = ${v.fa}`)
        .join('\n');
      contextPrompt += `\n\nواژگان این درس:\n${vocabList}`;
    }
    if (lessonContext) {
      contextPrompt += `\n\nموضوع درس: ${lessonContext}`;
    }

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: contextPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);

      if (response.status === 429) {
        return json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
      }

      return json({ error: 'Failed to get response from AI' }, { status: 500 });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return json({ error: 'Empty response from AI' }, { status: 500 });
    }

    return json({
      message: assistantMessage,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens,
        completion_tokens: data.usage?.completion_tokens,
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
