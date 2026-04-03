import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, RefreshCw, Check, Wand2, Target, Users, MessageSquare } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { generateContent } from '../services/claude';
import { getCollection } from '../services/pocketbase';

export default function ConceptStep() {
    const { contentData, updateContent } = useGlobalContext();
    const { language, t } = useLanguage();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [generationError, setGenerationError] = useState(null);

    const [showCustomAudience, setShowCustomAudience] = useState(false);
    const [showCustomTone, setShowCustomTone] = useState(false);
    const inputSources = ['www.pinkmilk.eu/lp', 'notebooklm [ for later ]'];

    const handleGenerate = async () => {
        if (!contentData.concept.topic) return;

        setGenerationError(null);
        setIsConnecting(true);

        setTimeout(async () => {
            setIsConnecting(false);
            setIsGenerating(true);
            try {
                const prompt = `
                    Generate exactly 4 unique social media content concept suggestions.
                    Topic: ${contentData.concept.topic}
                    Target Audience: ${contentData.concept.audience}
                    Tone: ${contentData.concept.tone}
                    Platforms: ${contentData.concept.goals.join(', ')}
                    Additional info: ${contentData.concept.extra_input}
                    Source context: ${contentData.concept.input_source}

                    Response MUST be only a JSON array. Each object in the array must have:
                    - id: number (1-4)
                    - title: string (short, catchy)
                    - description: string (detailed)
                    - keyPoints: array of 3 strings

                    Language: ${language === 'nl' ? 'Dutch' : 'English'}
                    Output ONLY the JSON array. No explanations.
                `;

                const result = await generateContent(prompt, "You are a professional social media strategist. Return valid JSON ONLY.");
                console.log('Claude Raw Result:', result);

                // Better JSON extraction
                const start = result.indexOf('[');
                const end = result.lastIndexOf(']') + 1;

                if (start !== -1 && end !== -1) {
                    const jsonStr = result.substring(start, end).trim();
                    try {
                        const parsed = JSON.parse(jsonStr);
                        console.log('Successfully parsed concepts:', parsed);
                        updateContent('concept', { suggestions: parsed });
                    } catch (parseError) {
                        console.error('JSON Parse Error:', parseError);
                        throw new Error('Claude returned invalid JSON format. Please try again.');
                    }
                } else {
                    console.error('No JSON array found in result');
                    throw new Error('Claude response was not in the expected format.');
                }
            } catch (error) {
                console.error('Generation failed:', error);
                setGenerationError(error.message);
            } finally {
                setIsGenerating(false);
            }
        }, 1500);
    };

    const selectConcept = (concept) => {
        updateContent('concept', { selected: concept });
    };

    return (
        <div className="container-grid cols-2" style={{ height: '100%' }}>
            {/* Left Container: Input */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Lightbulb size={20} style={{ color: 'var(--accent-amber)' }} />
                        {t('whatCreate')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label className="label">{t('describeIdea')}</label>
                        <textarea
                            className="textarea"
                            value={contentData.concept.topic}
                            onChange={(e) => updateContent('concept', { topic: e.target.value })}
                            placeholder={t('describeIdeaPlaceholder')}
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div>
                            <label className="label">
                                <Users size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                {t('targetAudience')}
                            </label>
                            <select
                                className="select"
                                value={showCustomAudience ? 'Other' : contentData.concept.audience}
                                onChange={(e) => {
                                    if (e.target.value === 'Other') {
                                        setShowCustomAudience(true);
                                    } else {
                                        setShowCustomAudience(false);
                                        updateContent('concept', { audience: e.target.value });
                                    }
                                }}
                            >
                                <option>Creators & Entrepreneurs</option>
                                <option>Marketing Professionals</option>
                                <option>Small Business Owners</option>
                                <option>Tech Enthusiasts</option>
                                <option>General Audience</option>
                                <option value="Other">{t('other')}</option>
                            </select>
                            {showCustomAudience && (
                                <input
                                    type="text"
                                    className="input"
                                    style={{ marginTop: '8px' }}
                                    placeholder={t('chooseOrAdd')}
                                    value={contentData.concept.audience}
                                    onChange={(e) => updateContent('concept', { audience: e.target.value })}
                                />
                            )}
                        </div>
                        <div>
                            <label className="label">
                                <MessageSquare size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                {t('toneOfVoice')}
                            </label>
                            <select
                                className="select"
                                value={showCustomTone ? 'Other' : contentData.concept.tone}
                                onChange={(e) => {
                                    if (e.target.value === 'Other') {
                                        setShowCustomTone(true);
                                    } else {
                                        setShowCustomTone(false);
                                        updateContent('concept', { tone: e.target.value });
                                    }
                                }}
                            >
                                <option>Professional & Informative</option>
                                <option>Casual & Friendly</option>
                                <option>Bold & Inspiring</option>
                                <option>Educational & Detailed</option>
                                <option value="Other">{t('other')}</option>
                            </select>
                            {showCustomTone && (
                                <input
                                    type="text"
                                    className="input"
                                    style={{ marginTop: '8px' }}
                                    placeholder={t('chooseOrAdd')}
                                    value={contentData.concept.tone}
                                    onChange={(e) => updateContent('concept', { tone: e.target.value })}
                                />
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div>
                            <label className="label">{t('inputSource')}</label>
                            <select
                                className="select"
                                value={contentData.concept.input_source}
                                onChange={(e) => updateContent('concept', { input_source: e.target.value })}
                            >
                                <option value="">{t('select')}...</option>
                                {inputSources.map(source => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">{t('extraInput')}</label>
                            <input
                                type="text"
                                className="input"
                                value={contentData.concept.extra_input || ''}
                                onChange={(e) => updateContent('concept', { extra_input: e.target.value })}
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            <Target size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('targetPlatforms')}
                        </label>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                            {['YouTube', 'TikTok', 'Instagram', 'Facebook', 'LinkedIn', 'Bluesky', 'Blog'].map(platform => (
                                <button
                                    key={platform}
                                    onClick={() => {
                                        const newGoals = contentData.concept.goals.includes(platform)
                                            ? contentData.concept.goals.filter(g => g !== platform)
                                            : [...contentData.concept.goals, platform];
                                        updateContent('concept', { goals: newGoals });
                                    }}
                                    className={`platform-pill ${contentData.concept.goals.includes(platform) ? 'active' : ''}`}
                                >
                                    {platform}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container-footer">
                    {isConnecting ? (
                        <div style={{ color: 'var(--accent-purple)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RefreshCw size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                            {t('connectingToClaude')}
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleGenerate}
                            disabled={isGenerating || !contentData.concept.topic}
                            style={{ opacity: !contentData.concept.topic ? 0.5 : 1 }}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                                    {t('generating')}
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    {t('generateConcepts')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Right Container: AI Concepts */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Sparkles size={20} style={{ color: 'var(--accent-purple)' }} />
                        {t('conceptOptions')}
                    </h3>
                    {contentData.concept.suggestions.length > 0 && (
                        <span className="badge badge-ai">{t('aiGenerated')}</span>
                    )}
                </div>

                <div className="container-body">
                    {generationError && (
                        <div style={{
                            padding: 'var(--space-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--accent-red)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--accent-red)',
                            marginBottom: 'var(--space-md)',
                            fontSize: '14px'
                        }}>
                            <strong>Error:</strong> {generationError}
                        </div>
                    )}

                    {Array.isArray(contentData.concept.suggestions) && contentData.concept.suggestions.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            {contentData.concept.suggestions.map((concept) => (
                                <motion.div
                                    key={concept.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: concept.id * 0.1 }}
                                    className={`card ${contentData.concept.selected?.id === concept.id ? 'selected' : ''}`}
                                    onClick={() => selectConcept(concept)}
                                >
                                    <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                                        <h5 style={{ fontSize: '16px', color: 'var(--slate-950)' }}>{concept.title}</h5>
                                        {contentData.concept.selected?.id === concept.id && (
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Check size={14} style={{ color: 'white' }} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-small text-muted" style={{ marginBottom: '12px', lineHeight: 1.5 }}>
                                        {concept.description}
                                    </p>
                                    <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                        {concept.keyPoints.map((point, i) => (
                                            <span key={i} className="badge badge-pending">{point}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--slate-400)',
                            textAlign: 'center',
                            padding: 'var(--space-2xl)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'var(--slate-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--space-lg)'
                            }}>
                                <Sparkles size={32} style={{ color: 'var(--slate-300)' }} />
                            </div>
                            <p className="font-heading" style={{ fontSize: '20px', color: 'var(--slate-500)', marginBottom: '8px' }}>
                                {isGenerating ? t('generating') : t('noConcepts')}
                            </p>
                            <p className="text-small text-muted">
                                {isGenerating ? t('processing') : t('noConceptsDesc')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="container-footer">
                    {contentData.concept.suggestions.length > 0 && (
                        <button className="btn btn-secondary" onClick={handleGenerate} disabled={isGenerating}>
                            <RefreshCw size={16} className={isGenerating ? 'spinner' : ''} /> {t('regenerate')}
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        disabled={!contentData.concept.selected}
                        style={{ opacity: !contentData.concept.selected ? 0.5 : 1 }}
                    >
                        {t('useSelected')}
                    </button>
                </div>

                {/* Debug Log Area */}
                <div style={{
                    marginTop: 'auto',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderTop: '1px solid #dee2e6',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#6c757d',
                    maxHeight: '100px',
                    overflowY: 'auto'
                }}>
                    <strong>Debug Log:</strong>
                    <div id="debug-log-console">
                        {/* We'll use a simple ref-less approach for now or just a few state variables if we wanted, 
                            but for now I'll just add a manual log entry state if I want to be 100% sure */}
                    </div>
                </div>
            </div>
        </div>
    );
}
