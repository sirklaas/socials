import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

const anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Since we're in a frontend app (not ideal for production, but okay for this prototype)
});

export async function generateContent(prompt, systemPrompt = "You are a social media expert.") {
    console.log('Claude API Key loaded:', !!apiKey);
    if (!apiKey) {
        throw new Error('Claude API key is not configured. Please add VITE_CLAUDE_API_KEY to your .env file.');
    }

    try {
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }],
        });

        return response.content[0].text;
    } catch (error) {
        console.error('Claude API Error:', error);
        throw error;
    }
}

export default { generateContent };
