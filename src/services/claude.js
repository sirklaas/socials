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
        'Geen API key. Open het bestand .env naast package.json en zet één regel: ANTHROPIC_API_KEY=… (of VITE_ANTHROPIC_API_KEY=… of VITE_CLAUDE_API_KEY=…), zonder aanhalingstekens. Sla op en herstart npm run dev. Op Vercel: zelfde variabele(n) onder Project Settings → Environment Variables en opnieuw deployen.',
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

## PocketBase / CMS field mapping (must follow)

Each card is stored in the app as JSON and copied into the campaign **blog** object in PocketBase (\`blog.title\`, \`blog.content\`, \`blog.seo\`). Fill every field on purpose:

- **intro_heading**: Kicker / hook above the article. Shown before the body (in the editor it is prefixed as an italic intro line). Keep it punchy (one short line).
- **heading**: Main H1 and **blog title**. Also becomes **SEO title** (\`blog.seo.title\`). Must work as a standalone headline.
- **sub_heading**: Dek / subtitle — supports the heading and seeds **meta description** (with body text truncated for length). One or two lines.
- **body**: Full post copy: **4–8** short paragraphs or single lines separated by line breaks. This is the bulk of \`blog.content\` (after the intro line). Plain text only, no markdown headings.

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

const VISUAL_DIRECTOR_SYSTEM = `You are an art director for Pink Milk: Dutch entertainment, live-show energy, quizzes, warm sharp humor. You write English prompts for diffusion / image models (no text in images, no logos, no real celebrity faces).`;

/**
 * Step 3: three distinct visual directions (hero + sub image prompts each).
 * @param {object} ctx
 * @param {{ intro_heading?: string, heading?: string, sub_heading?: string, body?: string }} ctx.card
 * @param {{ main?: string, sub?: string } | null} ctx.seedPrompts — optional hints from step 1
 * @param {string} ctx.visualStyle minimal | bold | professional | creative
 * @param {'nl'|'en'} ctx.lang
 */
export async function generateThreeVisualPromptVariants(ctx) {
    const { card = {}, seedPrompts = null, visualStyle = 'minimal', lang = 'nl' } = ctx;
    const styleGuide = {
        minimal: 'clean negative space, restrained palette, calm composition, typography-friendly',
        bold: 'high contrast, saturated accents, dynamic asymmetry, high energy',
        professional: 'polished, broadcast-grade, trustworthy studio lighting',
        creative: 'unexpected framing, playful editorial feel, artistic risk',
    };
    const styleLine = styleGuide[visualStyle] || styleGuide.minimal;
    const seedBlock =
        seedPrompts && (seedPrompts.main || seedPrompts.sub)
            ? `Reference prompts from earlier (reinterpret — do not copy):\n- Main: ${seedPrompts.main || '—'}\n- Sub: ${seedPrompts.sub || '—'}\n`
            : '';

    const langName = lang === 'nl' ? 'Dutch' : 'English';
    const prompt = `## Content brief (for mood only)
- intro_heading: ${card.intro_heading || '—'}
- heading: ${card.heading || '—'}
- sub_heading: ${card.sub_heading || '—'}
- body excerpt: ${(card.body || '').slice(0, 1800)}

${seedBlock}
## Visual direction lock
Apply this aesthetic across all three concepts: **${styleLine}** (interpret in three different ways).

## Task
Produce **exactly 3** clearly **different** visual concepts for still images (hero + secondary) for this campaign.
Each concept must have a distinct composition idea, mood, and color story — not three tiny tweaks of the same shot.

Rules:
- Prompts in **English** (best for image models).
- No readable text, lettering, or logos in the scene.
- No specific real celebrity or politician likenesses.

Return ONLY valid JSON (no markdown):
{
  "variants": [
    {
      "id": "1",
      "label": "short name for this look, max 6 words",
      "angle": "one sentence: what makes this direction unique",
      "main_image_prompt": "one detailed paragraph: hero / key art",
      "sub_image_prompt": "one detailed paragraph: secondary / sectional / companion image"
    }
  ]
}

Use ids "1", "2", "3". Context for tone of the show (not literal text in images): content is **${langName}**-market entertainment.`;

    const raw = await callClaude(
        prompt,
        `${VISUAL_DIRECTOR_SYSTEM} Return ONLY valid JSON. No markdown.`,
        4096,
    );
    const parsed = extractJson(raw);
    if (!parsed || !Array.isArray(parsed.variants) || parsed.variants.length < 3) {
        throw new Error(
            lang === 'nl'
                ? 'Claude gaf geen 3 visuele concepten terug. Probeer opnieuw.'
                : 'Claude did not return 3 visual concepts. Try again.',
        );
    }
    return parsed.variants.slice(0, 3).map((v, i) => ({
        id: String(v.id ?? i + 1),
        label: String(v.label || `Concept ${i + 1}`),
        angle: String(v.angle || ''),
        main_image_prompt: String(v.main_image_prompt || ''),
        sub_image_prompt: String(v.sub_image_prompt || v.main_image_prompt || ''),
    }));
}

/** English image briefs via Anthropic Claude (text-only); use those prompts in Midjourney, SDXL, etc. */
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

export default {
    generateIdeaConceptCards,
    generateImagePromptsForChannel,
    generateThreeVisualPromptVariants,
};
