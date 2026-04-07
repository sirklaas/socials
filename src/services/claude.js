import Anthropic from '@anthropic-ai/sdk';
import { extractJson } from '../utils/jsonFromLLM.js';

/** Injected in vite.config from .env (ANTHROPIC_API_KEY or VITE_ANTHROPIC_API_KEY). */
function getApiKey() {
    const fromVite =
        typeof __PM_ANTHROPIC_KEY__ !== 'undefined' ? String(__PM_ANTHROPIC_KEY__).trim() : '';
    return (
        fromVite ||
        String(import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim() ||
        String(import.meta.env.VITE_CLAUDE_API_KEY || '').trim() ||
        ''
    );
}

const CONCEPT_SYSTEM = `You are Pink Milk's creative partner: Dutch entertainment, live-feel shows, quizzes, and sharp but warm humor. Your job is to invent content ideas that feel personal to the brand and the show formats — not generic marketing.`;

function missingKeyError() {
    return new Error(
        'Geen API key. Open het bestand .env naast package.json en zet één regel: ANTHROPIC_API_KEY=jouw_key hier (of VITE_ANTHROPIC_API_KEY=...). Sla op en herstart npm run dev.',
    );
}

async function callClaude(prompt, system, maxTokens) {
    const apiKey = getApiKey();
    if (!apiKey) throw missingKeyError();

    const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
    });

    const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text;
}

/**
 * @param {object} selections
 * @param {string} lang 'nl' | 'en'
 */
export async function generateIdeaConceptCards(selections, lang = 'nl') {
    const { news, social, pinkmilk, pinkmilkExtra } = selections;
    const langName = lang === 'nl' ? 'Dutch' : 'English';
    const extra = (pinkmilkExtra && String(pinkmilkExtra).trim()) || '—';

    const prompt = `## Inspiration (anchors only — do not copy verbatim sparks only)

1) Entertainment / news pulse (NL): **${news?.title || '—'}**
   Context: ${news?.summary || '—'}

2) What's trending (e.g. YouTube / social NL): **${social?.title || '—'}**
   Context: ${social?.summary || '—'}

3) Pink Milk show or format we're leaning into: **${pinkmilk?.title || '—'}**
   Context: ${pinkmilk?.summary || '—'}

4) Extra note from the creator (optional): ${extra}

## Your task

Produce **exactly 5** different, **creative** content concepts for Pink Milk.

Each concept must do at least one of the following:
- Reveal something about **what these shows are** (energy, games, audience, Dutch TV nostalgia, studio vibe).
- Say something about **the creator / host persona** — warmth, wit, self-aware humor, connection with the audience — without inventing biographical facts that weren't implied above.
- Connect **lightly** to the news or trending thread only where it feels natural; never force hard news into a comedy-show frame.

Rules:
- The 5 ideas must be **clearly distinct** (different hooks, formats, angles — not five versions of the same post).
- Favor ideas that could become a **blog post, carousel, or caption** for this brand.
- Avoid war, graphic violence, crime sensationalism, and cruel punch-down humor.
- Language for all user-visible strings: **${langName}**.

Return ONLY valid JSON (no markdown, no commentary):
{
  "cards": [
    {
      "id": "1",
      "intro_heading": "short hook line",
      "heading": "main title",
      "sub_heading": "supporting line",
      "body": "plain text, 4-8 short paragraphs or single lines separated by line breaks"
    }
  ]
}

Use ids "1" through "5".`;

    const raw = await callClaude(
        prompt,
        `${CONCEPT_SYSTEM} You return ONLY valid JSON objects. No markdown fences.`,
        4096,
    );
    const parsed = extractJson(raw);
    if (!parsed || !Array.isArray(parsed.cards) || parsed.cards.length < 5) {
        throw new Error('Claude gaf geen 5 concepten terug in JSON. Probeer opnieuw.');
    }
    return parsed.cards.slice(0, 5);
}

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

    const raw = await callClaude(prompt, 'You return ONLY valid JSON. No markdown.', 2048);
    const parsed = extractJson(raw);
    if (!parsed || typeof parsed.main_image_prompt !== 'string') {
        throw new Error('Claude gaf geen geldige image prompts terug.');
    }
    return {
        main: parsed.main_image_prompt,
        sub: typeof parsed.sub_image_prompt === 'string' ? parsed.sub_image_prompt : parsed.main_image_prompt,
    };
}

export default { generateIdeaConceptCards, generateImagePromptsForChannel };
