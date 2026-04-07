import React, { useState } from 'react';
import { Type, Hash, Sparkles, RefreshCw, Copy, Youtube, Instagram, Linkedin, Facebook, Smartphone } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';

const PLATFORMS = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'tiktok', name: 'TikTok', icon: Smartphone, color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
];

export default function ContentCreationStep() {
    const { contentData, setPlatformContent } = useGlobalContext();
    const { language, t } = useLanguage();
    const [activePlatform, setActivePlatform] = useState('youtube');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAll = () => {
        setIsGenerating(true);
        setTimeout(() => {
            PLATFORMS.forEach(p => {
                if (language === 'nl') {
                    setPlatformContent(p.id, {
                        title: `Hoe ${contentData.concept.selected?.title || 'AI Tools'} Jouw ${p.name} Strategie Kan Transformeren`,
                        body: `Het landschap van digitale creatie evolueert snel. In deze post verkennen we hoe ${contentData.concept.selected?.title || 'innovatieve benaderingen'} je kunnen helpen betere resultaten te behalen op ${p.name}.\n\nBelangrijkste punten:\n• Automatiseer repetitieve taken\n• Focus op wat echt telt\n• Schaal je content productie\n• Behoud je authentieke stem`,
                        hashtags: ['#ContentCreatie', '#DigitaleMarketing', '#AI', '#CreatorEconomie', '#SocialMedia']
                    });
                } else {
                    setPlatformContent(p.id, {
                        title: `How ${contentData.concept.selected?.title || 'AI Tools'} Can Transform Your ${p.name} Strategy`,
                        body: `The landscape of digital creation is evolving rapidly. In this post, we explore how ${contentData.concept.selected?.title || 'innovative approaches'} can help you achieve better results on ${p.name}.\n\nKey takeaways:\n• Automate repetitive tasks\n• Focus on what matters\n• Scale your content output\n• Maintain authentic voice`,
                        hashtags: ['#ContentCreation', '#DigitalMarketing', '#AI', '#CreatorEconomy', '#SocialMedia']
                    });
                }
            });
            setIsGenerating(false);
        }, 2000);
    };

    const currentData = contentData.platforms[activePlatform] || { title: '', body: '', hashtags: [] };
    const currentPlatform = PLATFORMS.find(p => p.id === activePlatform);

    return (
        <div className="container-grid cols-3" style={{ height: '100%' }}>
            {/* Container 1: Headlines */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Type size={20} style={{ color: 'var(--primary)' }} />
                        {t('headlines')}
                    </h3>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleGenerateAll}
                        disabled={isGenerating}
                    >
                        {isGenerating ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                        {isGenerating ? t('generating') : t('generateAll')}
                    </button>
                </div>

                <div className="container-body">
                    {/* Platform Tabs */}
                    <div className="flex gap-sm" style={{ marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                        {PLATFORMS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActivePlatform(p.id)}
                                className={`platform-pill ${activePlatform === p.id ? 'active' : ''}`}
                            >
                                <p.icon size={14} />
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {/* Headline Editor */}
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="label">{t('titleHeadline')}</label>
                        <textarea
                            className="textarea"
                            value={currentData.title}
                            onChange={(e) => setPlatformContent(activePlatform, { title: e.target.value })}
                            placeholder="Enter your headline..."
                            style={{ minHeight: '100px' }}
                        />
                        <div className="flex justify-between" style={{ marginTop: '8px' }}>
                            <span className="text-caption text-muted">
                                {currentData.title.length} characters
                            </span>
                            <button className="text-caption" style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Copy size={12} /> {t('copy')}
                            </button>
                        </div>
                    </div>

                    {/* Alternative Headlines */}
                    <div>
                        <label className="label">{t('alternativeHeadlines')}</label>
                        <div className="flex flex-col gap-sm">
                            {(language === 'nl' ? ['Korte & Krachtige Versie', 'Vraag Formaat', 'Hoe-To Formaat'] : ['Short & Punchy Version', 'Question Format', 'How-To Format']).map((type, i) => (
                                <div key={i} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }}>
                                    <span className="text-caption text-muted">{type}</span>
                                    <p className="text-small" style={{ marginTop: '4px', color: 'var(--slate-700)' }}>
                                        {currentData.title ? `${currentData.title.substring(0, 40)}...` : t('noContent')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Container 2: Body Text */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <currentPlatform.icon size={20} style={{ color: currentPlatform.color }} />
                        {currentPlatform.name} {t('copy')}
                    </h3>
                    <span className="badge badge-ai">{t('aiGenerated')}</span>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                        <textarea
                            className="textarea"
                            value={currentData.body}
                            onChange={(e) => setPlatformContent(activePlatform, { body: e.target.value })}
                            placeholder="Your post content will appear here..."
                            style={{
                                minHeight: '300px',
                                height: '100%',
                                resize: 'none'
                            }}
                        />
                    </div>

                    {/* Character Count & Actions */}
                    <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-md)' }}>
                        <div className="flex gap-md">
                            <span className="text-caption text-muted">
                                {currentData.body.length} characters
                            </span>
                            <span className="text-caption" style={{
                                color: currentData.body.length > 2200 ? 'var(--error)' : 'var(--success)'
                            }}>
                                {currentData.body.length > 2200 ? t('incomplete') : t('ready')}
                            </span>
                        </div>
                        <div className="flex gap-sm">
                            <button className="btn btn-secondary btn-sm">
                                <RefreshCw size={14} /> {t('regenerate')}
                            </button>
                        </div>
                    </div>

                    {/* Mini Preview */}
                    <div style={{
                        marginTop: 'var(--space-lg)',
                        padding: 'var(--space-md)',
                        background: 'var(--slate-50)',
                        borderRadius: '8px',
                        border: '1px solid var(--slate-200)'
                    }}>
                        <p className="text-caption text-muted" style={{ marginBottom: '8px' }}>{t('preview')}</p>
                        <div style={{
                            background: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--slate-200)',
                            fontSize: '13px',
                            lineHeight: 1.5,
                            color: 'var(--slate-700)',
                            maxHeight: '100px',
                            overflow: 'hidden'
                        }}>
                            {currentData.body ? `${currentData.body.substring(0, 200)}...` : t('noContent')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Container 3: Hashtags */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Hash size={20} style={{ color: 'var(--accent-coral)' }} />
                        {t('hashtags')}
                    </h3>
                </div>

                <div className="container-body">
                    <label className="label">{t('selectedHashtags')}</label>
                    <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-lg)' }}>
                        {currentData.hashtags.map((tag, i) => (
                            <span
                                key={i}
                                className="platform-pill active"
                                style={{ cursor: 'pointer' }}
                            >
                                {tag}
                                <span style={{ marginLeft: '4px', opacity: 0.5 }}>×</span>
                            </span>
                        ))}
                        <button className="platform-pill" style={{ borderStyle: 'dashed' }}>
                            + {t('add')}
                        </button>
                    </div>

                    <label className="label">{t('suggestedHashtags')}</label>
                    <div className="flex flex-col gap-sm">
                        {(language === 'nl' ? ['#ContentStrategie', '#GroeiHacking', '#Viraal', '#Trending', '#Marketing2026'] : ['#ContentStrategy', '#GrowthHacking', '#Viral', '#Trending', '#Marketing2026']).map((tag, i) => (
                            <div
                                key={i}
                                className="card"
                                style={{
                                    padding: 'var(--space-sm) var(--space-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span className="text-small">{tag}</span>
                                <div className="flex items-center gap-sm">
                                    <span className="text-caption text-muted">~10K posts</span>
                                    <button style={{
                                        background: 'var(--primary-ultralight)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        color: 'var(--primary)',
                                        fontSize: '12px'
                                    }}>
                                        {t('add')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <label className="label">{language === 'nl' ? 'Hashtag Prestaties' : 'Hashtag Performance'}</label>
                        <div style={{
                            padding: 'var(--space-md)',
                            background: 'var(--slate-50)',
                            borderRadius: '8px'
                        }}>
                            <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                                <span className="text-small">{language === 'nl' ? 'Bereik Potentieel' : 'Reach Potential'}</span>
                                <span className="text-small font-medium" style={{ color: 'var(--success)' }}>{language === 'nl' ? 'Hoog' : 'High'}</span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: 'var(--slate-200)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: '75%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--primary), var(--accent-purple))',
                                    borderRadius: '4px'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
