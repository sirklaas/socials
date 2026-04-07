import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createSocial, updateSocial, getAllSocials, parseSocialRecord } from '../services/pocketbase';

const GlobalContext = createContext();

export const defaultIdeaFlow = {
    newsTopics: [],
    socialTopics: [],
    picks: { newsUrl: null, socialUrl: null },
    conceptCards: [],
    selectedCardId: null,
    selectedChannel: 'blog',
    facebookLinkedFromInsta: false,
    imagePrompts: null,
};

const defaultConcept = {
    topic: '',
    audience: 'Entrepreneurs',
    tone: 'Professional',
    input_source: '',
    extra_input: '',
    goals: [],
    suggestions: [],
    selected: null,
    ideaFlow: { ...defaultIdeaFlow },
};

function normalizeConcept(concept) {
    const c = concept && typeof concept === 'object' ? concept : {};
    return {
        ...defaultConcept,
        ...c,
        ideaFlow: {
            ...defaultIdeaFlow,
            ...(c.ideaFlow && typeof c.ideaFlow === 'object' ? c.ideaFlow : {}),
            picks: {
                ...defaultIdeaFlow.picks,
                ...(c.ideaFlow?.picks && typeof c.ideaFlow.picks === 'object' ? c.ideaFlow.picks : {}),
            },
        },
    };
}

const initialContentData = {
    concept: normalizeConcept({}),
    platforms: {
        youtube: { enabled: true, title: '', body: '', hashtags: [] },
        tiktok: { enabled: true, title: '', body: '', hashtags: [] },
        instagram: { enabled: true, title: '', body: '', hashtags: [] },
        facebook: { enabled: true, title: '', body: '', hashtags: [] },
        linkedin: { enabled: true, title: '', body: '', hashtags: [] },
        bluesky: { enabled: true, title: '', body: '', hashtags: [] }
    },
    visuals: {
        hero: null,
        variations: [],
        thumbnails: [],
        imagePrompts: null,
    },
    video: {
        script: '',
        scenes: [],
        assets: []
    },
    blog: {
        title: '',
        outline: [],
        content: '',
        seo: { title: '', description: '', keywords: [] }
    },
    schedule: {
        date: null,
        time: null,
        platformSettings: {}
    }
};

export const GlobalProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [contentData, setContentData] = useState(initialContentData);
    const [currentRecordId, setCurrentRecordId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load campaigns from PocketBase on mount
    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setIsLoading(true);
        try {
            console.log('Fetching campaigns from PocketBase...');
            const records = await getAllSocials();
            if (records && Array.isArray(records)) {
                const parsed = records.map(parseSocialRecord).filter(Boolean);
                console.log(`Loaded ${parsed.length} campaigns.`);
                setCampaigns(parsed);
            } else {
                console.warn('No campaigns records returned or invalid format:', records);
                setCampaigns([]);
            }
        } catch (error) {
            console.error('Failed to load campaigns:', error);
            setCampaigns([]);
        } finally {
            setIsLoading(false);
        }
    };

    const saveToDatabase = useCallback(async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            // Only save to PocketBase if it's not a local mock record
            if (currentRecordId && !currentRecordId.startsWith('local-')) {
                await updateSocial(currentRecordId, {
                    concept: contentData.concept,
                    platforms: contentData.platforms,
                    visuals: contentData.visuals,
                    video: contentData.video,
                    blog: contentData.blog,
                    schedule: contentData.schedule,
                });
            }
            setLastSaved(new Date());
        } catch (error) {
            console.error('Failed to save to PocketBase:', error);
            // We still update lastSaved locally so the user knows their changes are in memory
            setLastSaved(new Date());
        } finally {
            setIsSaving(false);
        }
    }, [contentData, currentRecordId, isSaving]);

    useEffect(() => {
        if (!currentRecordId) return;

        const saveTimeout = setTimeout(async () => {
            await saveToDatabase();
        }, 2000);

        return () => clearTimeout(saveTimeout);
    }, [contentData, currentRecordId, saveToDatabase]);

    const createNewCampaign = async (name = 'Nieuwe Campagne') => {
        try {
            const record = await createSocial({
                name,
                concept: initialContentData.concept,
                platforms: initialContentData.platforms,
                visuals: initialContentData.visuals,
                video: initialContentData.video,
                blog: initialContentData.blog,
                schedule: initialContentData.schedule,
                language: 'nl',
                status: 'draft'
            });

            if (record && record.id) {
                setCurrentRecordId(record.id);
                setContentData(initialContentData);
                setCompletedSteps([]);
                setCurrentStep(1);
                setIsLoading(false);
                // Refresh campaigns list
                await loadCampaigns();
                return record;
            }
        } catch (error) {
            console.error('Failed to create campaign, using local mode:', error);
            // Fallback for offline/broken DB
            const mockId = 'local-' + Date.now();
            setCurrentRecordId(mockId);
            setContentData(initialContentData);
            setCompletedSteps([]);
            setCurrentStep(1);
            setIsLoading(false);
            return { id: mockId };
        } finally {
            setIsLoading(false);
        }
    };

    const loadCampaign = async (record) => {
        const parsed = typeof record === 'object' && record.id
            ? record
            : campaigns.find(c => c.id === record);

        if (parsed) {
            setCurrentRecordId(parsed.id);
            setContentData({
                concept: normalizeConcept(parsed.concept),
                platforms: parsed.platforms || initialContentData.platforms,
                visuals: { ...initialContentData.visuals, ...(parsed.visuals || {}) },
                video: parsed.video || initialContentData.video,
                blog: parsed.blog || initialContentData.blog,
                schedule: parsed.schedule || initialContentData.schedule,
            });
            setCompletedSteps([]);
            setCurrentStep(1);
        }
    };

    const updateContent = (section, data) => {
        setContentData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data }
        }));
    };

    const updateIdeaFlow = useCallback((partial) => {
        setContentData(prev => {
            const cur = prev.concept.ideaFlow || defaultIdeaFlow;
            const next = {
                ...cur,
                ...partial,
                picks: { ...cur.picks, ...(partial.picks || {}) },
            };
            return {
                ...prev,
                concept: { ...prev.concept, ideaFlow: next },
            };
        });
    }, []);

    const confirmStep1Blog = useCallback((card, imagePrompts) => {
        if (!card) return;
        const legacySelected = {
            id: card.id,
            title: card.heading,
            description: card.body,
            keyPoints: [card.intro_heading, card.sub_heading].filter(Boolean),
        };
        setContentData(prev => ({
            ...prev,
            concept: {
                ...prev.concept,
                topic: card.heading || prev.concept.topic,
                selected: legacySelected,
                suggestions: prev.concept.ideaFlow?.conceptCards?.length
                    ? prev.concept.ideaFlow.conceptCards.map((c, i) => ({
                          id: c.id ?? i + 1,
                          title: c.heading,
                          description: c.body,
                          keyPoints: [c.intro_heading, c.sub_heading].filter(Boolean),
                      }))
                    : prev.concept.suggestions,
                ideaFlow: {
                    ...prev.concept.ideaFlow,
                    imagePrompts: imagePrompts || prev.concept.ideaFlow?.imagePrompts || null,
                },
            },
            blog: {
                ...prev.blog,
                title: card.heading || prev.blog.title,
                content:
                    `${card.intro_heading ? `*${card.intro_heading}*\n\n` : ''}${card.body || ''}`.trim() ||
                    prev.blog.content,
                seo: {
                    ...prev.blog.seo,
                    title: card.heading || prev.blog.seo?.title,
                    description: (card.sub_heading || card.body || '').slice(0, 160),
                },
            },
            visuals: {
                ...prev.visuals,
                imagePrompts: imagePrompts || prev.visuals.imagePrompts,
            },
        }));
    }, []);

    const setPlatformContent = (platform, data) => {
        setContentData(prev => ({
            ...prev,
            platforms: {
                ...prev.platforms,
                [platform]: { ...prev.platforms[platform], ...data }
            }
        }));
    };

    const markStepComplete = (stepId) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps(prev => [...prev, stepId]);
        }
    };

    // Manual save trigger
    const forceSave = async () => {
        await saveToDatabase();
    };

    return (
        <GlobalContext.Provider value={{
            // Navigation
            currentStep,
            setCurrentStep,
            completedSteps,
            markStepComplete,

            // Content
            contentData,
            updateContent,
            updateIdeaFlow,
            confirmStep1Blog,
            setPlatformContent,

            // Database
            campaigns,
            currentRecordId,
            createNewCampaign,
            loadCampaign,
            loadCampaigns,
            forceSave,

            // Status
            isSaving,
            lastSaved,
            isLoading
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
