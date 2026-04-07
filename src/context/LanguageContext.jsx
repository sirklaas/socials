import React, { createContext, useContext, useState } from 'react';

const translations = {
    en: {
        // Navigation
        workflow: 'WORKFLOW',
        contentCampaign: 'Content Campaign',
        quickActions: 'Quick Actions',
        templates: 'Templates',
        assetLibrary: 'Asset Library',
        saveDraft: 'Save Draft',
        publishNow: 'Publish Now',

        // Steps
        step1: 'Concept',
        step1Sub: 'Define your idea',
        step2: 'Content',
        step2Sub: 'Create copy',
        step3: 'Visuals',
        step3Sub: 'Generate images',
        step4: 'Video',
        step4Sub: 'Produce clips',
        step5: 'Thumbnails',
        step5Sub: 'Design covers',
        step6: 'Blog Post',
        step6Sub: 'Write article',
        step7: 'Review',
        step7Sub: 'Check everything',
        step8: 'Schedule',
        step8Sub: 'Plan publishing',

        // Concept Step
        whatCreate: 'What would you like to create?',
        describeIdea: 'Describe your content idea',
        describeIdeaPlaceholder: 'E.g., A video series about how AI tools are changing the way creators work...',
        targetAudience: 'Target Audience',
        toneOfVoice: 'Tone of Voice',
        targetPlatforms: 'Target Platforms',
        inputSource: 'Input Source',
        extraInput: 'Extra Input',
        chooseOrAdd: 'Choose or add...',
        other: 'Other...',
        generateConcepts: 'Generate Concepts',
        conceptOptions: 'Concept Options',
        aiGenerated: 'AI Generated',
        noConcepts: 'No concepts yet',
        noConceptsDesc: 'Fill in your idea and click "Generate Concepts" to get AI-powered suggestions',
        regenerate: 'Regenerate',
        useSelected: 'Use Selected Concept',

        // Content Step
        headlines: 'Headlines',
        generateAll: 'Generate All',
        titleHeadline: 'Title / Headline',
        alternativeHeadlines: 'Alternative Headlines',
        copy: 'Copy',
        hashtags: 'Hashtags & Tags',
        selectedHashtags: 'Selected Hashtags',
        suggestedHashtags: 'Suggested Hashtags',

        // Visual Step
        imageSettings: 'Image Settings',
        platform: 'Platform',
        visualStyle: 'Visual Style',
        imagePrompt: 'Image Prompt',
        generateImages: 'Generate Images',
        generatedImages: 'Generated Images',
        noImages: 'No images generated yet',
        step3NeedsBrief:
            'Choose a concept in step 1 (or add a blog title) so Claude has a brief to work from.',
        step3GenerateClaudeVariants: 'Generate 3 visual prompts (Claude)',
        step3ClaudeGenerating: 'Claude is writing prompts…',
        step3ClaudeExplain:
            'Anthropic Claude returns three English prompt pairs (hero + sub) for tools like Midjourney / SDXL.',
        step3ClaudeConceptsTitle: 'AI visual concepts',
        step3NoVariantsYet: 'No prompt concepts yet',
        step3NoVariantsHint: 'Pick a visual style on the left, then generate three Claude concepts.',
        step3ConfirmVisualPrompts: 'Confirm chosen prompts',
        step3ConfirmedBadge: 'Confirmed for this campaign',
        step3MockGalleryHint:
            'Demo block: placeholder Unsplash grid only — not tied to Claude. Use your image tool with the prompts.',
        step1ImagePromptsInVisuals:
            'For this channel, generate tailored main + sub image prompts in step 3 (Visuals).',
        step1BlogImagePromptExplain:
            'For blog, Claude outputs English hero + inline image prompts (Midjourney / SDXL style).',
        step1FacebookLinkedHint:
            'Instagram-related target: Facebook-from-Instagram sync can follow this choice later.',
        step1ConfirmHint: 'Confirm to load the chosen card into the blog and downstream steps.',
        step3ChannelImagePromptsExplain:
            'Choose a target channel, then generate English main + sub prompts tuned for that format.',

        // Video Step
        videoScript: 'Video Script',
        sceneBreakdown: 'Scene Breakdown',
        videoSettings: 'Video Settings',
        platformFormat: 'Platform Format',
        targetDuration: 'Target Duration',
        backgroundMusic: 'Background Music',
        voiceover: 'Voiceover',
        generateVideo: 'Generate Video',
        videoPreview: 'Video Preview',

        // Thumbnail Step
        thumbnailSettings: 'Thumbnail Settings',
        textOverlay: 'Text Overlay',
        fontStyle: 'Font Style',
        colorScheme: 'Color Scheme',
        generateThumbnails: 'Generate Thumbnails',
        thumbnailVariations: 'Thumbnail Variations',

        // Blog Step
        outline: 'Outline',
        generate: 'Generate',
        blogEditor: 'Blog Editor',
        articleTitle: 'Article Title',
        seoSettings: 'SEO & Settings',
        featuredImage: 'Featured Image',
        metaDescription: 'Meta Description',
        tagsCategories: 'Tags & Categories',
        author: 'Author',
        livePreview: 'Live Preview',

        // Review Step
        contentChecklist: 'Content Checklist',
        textApproved: 'Text content approved',
        imagesSelected: 'Images selected',
        videoReady: 'Video script ready',
        hashtagsAdded: 'Hashtags added',
        blogComplete: 'Blog post complete',
        thumbnailsSelected: 'Thumbnails selected',
        platformsToPublish: 'Platforms to Publish',
        approveAndContinue: 'Approve & Continue',
        approveContinue: 'Approve & Continue',
        platformPreviews: 'Platform Previews',

        // Publish Step
        scheduleCalendar: 'Schedule Calendar',
        aiSuggestedTimes: 'AI-Suggested Optimal Times',
        publishSettings: 'Publish Settings',
        scheduledFor: 'Scheduled For',
        timezone: 'Timezone',
        scheduleAll: 'Schedule All',
        successfullyScheduled: 'Successfully Scheduled!',
        contentWillBePublished: 'Your content will be published at the scheduled time',

        // Common
        ready: 'Ready',
        incomplete: 'Incomplete',
        edit: 'Edit',
        add: 'Add',
        select: 'Select',
        download: 'Download',
        preview: 'Preview',
        approve: 'Approve',
        generating: 'Generating...',
        processing: 'Processing...',
        noContent: 'No content yet',
        grid: 'Grid',
        focus: 'Focus',
        newCampaign: '+ New Campaign',
        stepWord: 'Step',
        lastSavedLabel: 'Saved',
        minutesAgo: 'min ago',
        justSaved: 'Just saved',
        notSaved: 'Not saved',
        savingStatus: 'Saving...',
        connectingToClaude: '[ connecting to Claude - success ]',

        // Step 1 idea generator
        sourceNews: 'News NL',
        sourceSocial: 'Trending & social',
        colTrendingNews: 'Entertainment news',
        colTrendingSocial: 'Trending YouTube (NL)',
        colPinkmilkShows: 'Pink Milk shows',
        pinkmilkExtraLabel: 'Your note (optional)',
        pinkmilkExtraPlaceholder: 'e.g. sponsor, date, inside joke, angle…',
        topicPickHint: 'Pick one in each column.',
        regenerateTopics: 'Regenerate others',
        regenerateTopicsCompact: 'Refresh',
        loadTopicsError: 'Could not load topics. Check API or run vercel dev for /api.',
        picksCompleteHint: 'All three picked — generate AI concept cards.',
        generateAiCards: 'Generate AI concepts',
        aiConceptCards: 'AI concept cards',
        pickOneCard: 'Choose one card',
        channelTitle: 'Channel',
        platforms: 'Platforms',
        chBlog: 'Blog',
        chInstaPost: 'Instagram post',
        chReel: 'Reel',
        chCarousel: 'Carousel',
        chFacebookFromInsta: 'Facebook (from Instagram)',
        chYoutubeLong: 'YouTube long',
        chYoutubeShort: 'YouTube short',
        chTiktok: 'TikTok',
        chLinkedin: 'LinkedIn',
        chBluesky: 'Bluesky',
        genImagePrompts: 'Generate image prompts',
        imagePromptsTitle: 'Image prompts (AI)',
        imagePromptClaudeNote:
            'Uses Anthropic Claude (same API key as concepts) to write English text prompts for tools like Midjourney or SDXL — not the images themselves.',
        imagePromptMain: 'Main / hero',
        imagePromptSub: 'Sub image',
        confirmStep1: 'Confirm & continue',
        saveToPocketBase: 'Save to PocketBase',
        saveToPocketBaseHint:
            'Pushes the current campaign (incl. blog JSON) so site/blog consumers can read it.',
        offlineNoPocketBase: 'Offline campaign: create or pick a live campaign to sync to PocketBase.',
        facebookLinkedNote: 'Facebook will mirror Instagram for this campaign.',
        step1InspirationTitle: 'Pick your inspiration',
        step1TopicFeedIntro:
            'Three columns: pick one topic each. Then generate five AI concepts — they appear in one row below.',
        conceptHalfPlaceholder:
            'AI concepts and actions will use this lower half after you generate cards.',

        // Days
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun',
    },
    nl: {
        // Navigation
        workflow: 'WERKSTROOM',
        contentCampaign: 'Content Campagne',
        quickActions: 'Snelle Acties',
        templates: 'Sjablonen',
        assetLibrary: 'Mediabibliotheek',
        saveDraft: 'Concept Opslaan',
        publishNow: 'Nu Publiceren',

        // Steps
        step1: 'Concept',
        step1Sub: 'Definieer je idee',
        step2: 'Content',
        step2Sub: 'Maak tekst',
        step3: 'Visuals',
        step3Sub: 'Genereer afbeeldingen',
        step4: 'Video',
        step4Sub: 'Produceer clips',
        step5: 'Thumbnails',
        step5Sub: 'Ontwerp covers',
        step6: 'Blogpost',
        step6Sub: 'Schrijf artikel',
        step7: 'Review',
        step7Sub: 'Controleer alles',
        step8: 'Planning',
        step8Sub: 'Plan publicatie',

        // Concept Step
        whatCreate: 'Wat wil je maken?',
        describeIdea: 'Beschrijf je content idee',
        describeIdeaPlaceholder: 'Bijv., Een videoserie over hoe AI-tools de manier veranderen waarop creators werken...',
        targetAudience: 'Doelgroep',
        toneOfVoice: 'Tone of Voice',
        targetPlatforms: 'Doelplatforms',
        inputSource: 'Input Bron',
        extraInput: 'Extra Input',
        chooseOrAdd: 'Kies of voeg toe...',
        other: 'Anders...',
        generateConcepts: 'Genereer Concepten',
        conceptOptions: 'Concept Opties',
        aiGenerated: 'AI Gegenereerd',
        noConcepts: 'Nog geen concepten',
        noConceptsDesc: 'Vul je idee in en klik op "Genereer Concepten" voor AI-gestuurde suggesties',
        regenerate: 'Opnieuw Genereren',
        useSelected: 'Gebruik Geselecteerd Concept',

        // Content Step
        headlines: 'Koppen',
        generateAll: 'Genereer Alles',
        titleHeadline: 'Titel / Koptekst',
        alternativeHeadlines: 'Alternatieve Koppen',
        copy: 'Kopiëren',
        hashtags: 'Hashtags & Tags',
        selectedHashtags: 'Geselecteerde Hashtags',
        suggestedHashtags: 'Voorgestelde Hashtags',

        // Visual Step
        imageSettings: 'Afbeelding Instellingen',
        platform: 'Platform',
        visualStyle: 'Visuele Stijl',
        imagePrompt: 'Afbeelding Prompt',
        generateImages: 'Genereer Afbeeldingen',
        generatedImages: 'Gegenereerde Afbeeldingen',
        noImages: 'Nog geen afbeeldingen gegenereerd',
        step3NeedsBrief:
            'Kies eerst een concept in stap 1 (of vul een blogtitel) zodat Claude een brief heeft.',
        step3GenerateClaudeVariants: 'Genereer 3 visuele prompts (Claude)',
        step3ClaudeGenerating: 'Claude schrijft prompts…',
        step3ClaudeExplain:
            'Anthropic Claude levert drie Engelse prompt-paren (hoofd + sub) voor o.a. Midjourney / SDXL.',
        step3ClaudeConceptsTitle: 'AI-beeldconcepten',
        step3NoVariantsYet: 'Nog geen promptconcepten',
        step3NoVariantsHint: 'Kies een stijl links en genereer drie Claude-concepten.',
        step3ConfirmVisualPrompts: 'Bevestig gekozen prompts',
        step3ConfirmedBadge: 'Bevestigd voor deze campagne',
        step3MockGalleryHint:
            'Demo: Unsplash-placeholderrooster — niet gekoppeld aan Claude. Gebruik je image-tool met de prompts.',
        step1ImagePromptsInVisuals:
            'Voor dit kanaal: genereer afgestelde hoofd- en sub-prompts in stap 3 (Visuals).',
        step1BlogImagePromptExplain:
            'Voor blog: Claude levert Engelse hero- en sub-prompts (Midjourney / SDXL-stijl).',
        step1FacebookLinkedHint:
            'Instagram-gericht kanaal: synced posting naar Facebook kan hier later op aansluiten.',
        step1ConfirmHint: 'Bevestig om het gekozen concept naar de blog en vervolgstappen te zetten.',
        step3ChannelImagePromptsExplain:
            'Kies een doelkanaal en genereer Engelse hoofd- en sub-prompts afgestemd op dat format.',

        // Video Step
        videoScript: 'Video Script',
        sceneBreakdown: 'Scène Overzicht',
        videoSettings: 'Video Instellingen',
        platformFormat: 'Platform Formaat',
        targetDuration: 'Doel Duur',
        backgroundMusic: 'Achtergrondmuziek',
        voiceover: 'Voice-over',
        generateVideo: 'Genereer Video',
        videoPreview: 'Video Voorbeeld',

        // Thumbnail Step
        thumbnailSettings: 'Thumbnail Instellingen',
        textOverlay: 'Tekst Overlay',
        fontStyle: 'Lettertype Stijl',
        colorScheme: 'Kleurenschema',
        generateThumbnails: 'Genereer Thumbnails',
        thumbnailVariations: 'Thumbnail Variaties',

        // Blog Step
        outline: 'Overzicht',
        generate: 'Genereer',
        blogEditor: 'Blog Editor',
        articleTitle: 'Artikel Titel',
        seoSettings: 'SEO & Instellingen',
        featuredImage: 'Uitgelichte Afbeelding',
        metaDescription: 'Meta Beschrijving',
        tagsCategories: 'Tags & Categorieën',
        author: 'Auteur',
        livePreview: 'Live Voorbeeld',

        // Review Step
        contentChecklist: 'Content Checklist',
        textApproved: 'Tekst content goedgekeurd',
        imagesSelected: 'Afbeeldingen geselecteerd',
        videoReady: 'Video script klaar',
        hashtagsAdded: 'Hashtags toegevoegd',
        blogComplete: 'Blogpost compleet',
        thumbnailsSelected: 'Thumbnails geselecteerd',
        platformsToPublish: 'Platforms om te Publiceren',
        approveAndContinue: 'Goedkeuren & Doorgaan',
        approveContinue: 'Goedkeuren & Doorgaan',
        platformPreviews: 'Platform Voorbeelden',

        // Publish Step
        scheduleCalendar: 'Planning Kalender',
        aiSuggestedTimes: 'AI-Voorgestelde Optimale Tijden',
        publishSettings: 'Publicatie Instellingen',
        scheduledFor: 'Gepland Voor',
        timezone: 'Tijdzone',
        scheduleAll: 'Plan Alles',
        successfullyScheduled: 'Succesvol Ingepland!',
        contentWillBePublished: 'Je content wordt gepubliceerd op het geplande tijdstip',

        // Common
        ready: 'Klaar',
        incomplete: 'Onvolledig',
        edit: 'Bewerken',
        add: 'Toevoegen',
        select: 'Selecteren',
        download: 'Downloaden',
        preview: 'Voorbeeld',
        approve: 'Goedkeuren',
        generating: 'Genereren...',
        processing: 'Verwerken...',
        noContent: 'Nog geen content',
        grid: 'Raster',
        focus: 'Focus',
        newCampaign: '+ Nieuwe Campagne',
        stepWord: 'Stap',
        lastSavedLabel: 'Opgeslagen',
        minutesAgo: 'min geleden',
        justSaved: 'Zojuist opgeslagen',
        notSaved: 'Niet opgeslagen',
        savingStatus: 'Opslaan...',
        connectingToClaude: '[ verbinden met Claude - succes ]',

        // Step 1 idea generator
        sourceNews: 'Nieuws NL',
        sourceSocial: 'Trending & social',
        colTrendingNews: 'Entertainment nieuws',
        colTrendingSocial: 'Trending YouTube (NL)',
        colPinkmilkShows: 'Pink Milk shows',
        pinkmilkExtraLabel: 'Jouw toevoeging (optioneel)',
        pinkmilkExtraPlaceholder: 'bijv. sponsor, datum, hoek, grap…',
        topicPickHint: 'Kies één optie per kolom.',
        regenerateTopics: 'Anderen vernieuwen',
        regenerateTopicsCompact: 'Vernieuwen',
        loadTopicsError: 'Kon topics niet laden. Controleer API of start vercel dev voor /api.',
        picksCompleteHint: 'Alle drie gekozen — genereer AI-conceptkaarten.',
        generateAiCards: 'Genereer AI-concepten',
        aiConceptCards: 'AI-conceptkaarten',
        pickOneCard: 'Kies één kaart',
        channelTitle: 'Kanaal',
        platforms: 'Platformen',
        chBlog: 'Blog',
        chInstaPost: 'Instagram post',
        chReel: 'Reel',
        chCarousel: 'Carrousel',
        chFacebookFromInsta: 'Facebook (van Instagram)',
        chYoutubeLong: 'YouTube longform',
        chYoutubeShort: 'YouTube short',
        chTiktok: 'TikTok',
        chLinkedin: 'LinkedIn',
        chBluesky: 'Bluesky',
        genImagePrompts: 'Genereer image prompts',
        imagePromptsTitle: 'Image prompts (AI)',
        imagePromptClaudeNote:
            'Gebruikt Anthropic Claude (zelfde API key als concepten) voor Engelse tekstprompts voor o.a. Midjourney of SDXL — niet voor het renderen van plaatjes zelf.',
        imagePromptMain: 'Hoofd / hero',
        imagePromptSub: 'Sub-afbeelding',
        confirmStep1: 'Bevestig & ga verder',
        saveToPocketBase: 'Opslaan naar PocketBase',
        saveToPocketBaseHint:
            'Stuurt de huidige campagne (o.a. blog-JSON) naar de database zodat blogpagina’s die kunnen uitlezen.',
        offlineNoPocketBase:
            'Offline campagne: kies of maak een live campagne om met PocketBase te synchroniseren.',
        facebookLinkedNote: 'Facebook wordt voor deze campagne meegezet met Instagram.',
        step1InspirationTitle: 'Kies je inspiratie',
        step1TopicFeedIntro:
            'Drie kolommen: kies per kolom één topic. Genereer daarna vijf AI-concepten — die verschijnen in één rij eronder.',
        conceptHalfPlaceholder:
            'AI-concepten en acties verschijnen hier in de onderste helft zodra je kaarten hebt gegenereerd.',

        // Days
        mon: 'Ma',
        tue: 'Di',
        wed: 'Wo',
        thu: 'Do',
        fri: 'Vr',
        sat: 'Za',
        sun: 'Zo',
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('nl'); // Default to Dutch

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'nl' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
