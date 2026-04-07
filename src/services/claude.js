import Anthropic from '@anthropic-ai/sdk';
import { extractJson } from '../utils/jsonFromLLM.js';

const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

const anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Since we're in a frontend app (not ideal for production, but okay for this prototype)
});

/**
 * @param {object} selections { news, social } each { title, summary, source }
 * @param {string} lang 'nl' | 'en'
 */
export async function generateIdeaConceptCards(selections, lang = 'nl') {
    const { news, social, pinkmilk, pinkmilkExtra } = selections;
    const langName = lang === 'nl' ? 'Dutch' : 'English';
    const extra = (pinkmilkExtra && String(pinkmilkExtra).trim()) || '—';

    const prompt = `You are a content strategist for Pink Milk (creator / video / social brand).

The user selected these inspiration topics:

1) NEWS / entertainment headlines (Netherlands): Title: ${news?.title || '—'} — ${news?.summary || ''}
2) TRENDING (e.g. YouTube / social NL): Title: ${social?.title || '—'} — ${social?.summary || ''}
3) PINK MILK show / format to lean into: ${pinkmilk?.title || '—'} — ${pinkmilk?.summary || ''}
4) User's own note (optional, use if not "—"): ${extra}

Generate exactly 5 distinct content concept cards that could become a blog or social post. Tie ideas to the chosen show format where it fits; blend news + trending + optional note. Avoid war, graphic violence, or crime-heavy angles.

Return ONLY valid JSON with this shape (no markdown, no extra text):
{
  "cards": [
    {
      "id": "1",
      "intro_heading": "string, short hook line",
      "heading": "string, main title",
      "sub_heading": "string, supporting line",
      "body": "string, 4-8 short paragraphs or line breaks, plain text"
    }
  ]
}

Language for all strings: ${langName}.
Use ids "1" through "5".`;

    const raw = await generateContent(
        prompt,
        'You return ONLY valid JSON objects. No markdown fences.',
        4096
    );
    const parsed = extractJson(raw);
    if (!parsed || !Array.isArray(parsed.cards) || parsed.cards.length < 5) {
        throw new Error('Claude did not return 5 concept cards in expected JSON format.');
    }
    return parsed.cards.slice(0, 5);
}

/**
 * @param {object} card one concept card with heading, sub_heading, body, intro_heading
 * @param {string} channel e.g. blog
 * @param {string} lang
 */
export async function generateImagePromptsForChannel(card, channel, lang = 'nl') {
    const prompt = `Create image generation prompts for an AI image model (e.g. Midjourney / SDXL style).

Channel: ${channel}
Concept:
- intro_heading: ${card.intro_heading || ''}
- heading: ${card.heading || ''}
- sub_heading: ${card.sub_heading || ''}
- body: ${(card.body || '').slice(0, 2000)}

If channel is "blog", produce TWO prompts: a strong hero/main image and a secondary/sub image (inline illustration or sectional).
Style: clean, modern, creator-brand friendly, no text in the image, no logos, no real celebrity faces.

Return ONLY valid JSON:
{
  "main_image_prompt": "detailed English prompt, one paragraph",
  "sub_image_prompt": "detailed English prompt, one paragraph"
}

If channel is not blog, still return main_image_prompt and sub_image_prompt (sub can support a carousel/split layout). Language of prompts: English (image models work best in English).
Preferred content language context for the brief: ${lang === 'nl' ? 'Dutch' : 'English'}.`;

    const raw = await generateContent(
        prompt,
        'You return ONLY valid JSON. No markdown.',
        2048
    );
    const parsed = extractJson(raw);
    if (!parsed || typeof parsed.main_image_prompt !== 'string') {
        throw new Error('Claude did not return image prompts in expected JSON format.');
    }
    return {
        main: parsed.main_image_prompt,
        sub: typeof parsed.sub_image_prompt === 'string' ? parsed.sub_image_prompt : parsed.main_image_prompt,
    };
}

export async function generateContent(
    prompt,
    systemPrompt = 'You are a social media expert.',
    maxTokens = 2048
) {
    console.log('Claude API Key loaded:', !!apiKey);
    if (!apiKey) {
        throw new Error('Claude API key is not configured. Please add VITE_CLAUDE_API_KEY to your .env file.');
    }

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
        });

        return response.content[0].text;
    } catch (error) {
        console.error('Claude API Error:', error);
        throw error;
    }
}

export default { generateContent, generateIdeaConceptCards, generateImagePromptsForChannel };
