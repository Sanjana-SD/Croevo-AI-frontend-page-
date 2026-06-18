/**
 * Groq AI helper — talks to the Groq REST API from the browser.
 * Requires VITE_GROQ_API_KEY in .env
 */

const SYSTEM_PROMPT = `You are a helpful game-modification assistant for the Croevo AI gaming platform.
When a user asks you to change something about a game (colors, speed, difficulty, mechanics), 
respond with a short, friendly message explaining what you changed.
Keep responses concise (1-3 sentences). Be enthusiastic and fun.
If a user just wants to chat, respond conversationally.`;

export const queryGroq = async (userMessage) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Groq] VITE_GROQ_API_KEY is not set in .env');
    throw new Error(
      'Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file and restart the dev server.'
    );
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'unknown error');
    console.error(`[Groq] API error ${response.status}:`, errBody);
    throw new Error(`Groq API returned ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'No response from AI.';
};
