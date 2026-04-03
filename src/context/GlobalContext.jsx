import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createSocial, updateSocial, getAllSocials, parseSocialRecord } from '../services/pocketbase';

const GlobalContext = createContext();

const initialContentData = {
    concept: {
        topic: '',
        audience: 'Entrepreneurs',
        tone: 'Professional',
        input_source: '',
        extra_input: '',
        goals: [],
        suggestions: [],
        selected: null
    },
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
        thumbnails: []
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

    // Auto-save to PocketBase when content changes (debounced)
    useEffect(() => {
        if (!currentRecordId) return;

        const saveTimeout = setTimeout(async () => {
            await saveToDatabase();
        }, 2000); // 2 second debounce

        return () => clearTimeout(saveTimeout);
    }, [contentData, currentRecordId]);

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
                concept: parsed.concept || initialContentData.concept,
                platforms: parsed.platforms || initialContentData.platforms,
                visuals: parsed.visuals || initialContentData.visuals,
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
