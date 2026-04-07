import React, { useState } from 'react';
import { FileText, Wand2, RefreshCw, List, Search, Image, Tag, User, Clock, Eye, GripVertical } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export default function BlogStep() {
    const { contentData, updateContent } = useGlobalContext();
    const { language, t } = useLanguage();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            if (language === 'nl') {
                const mockOutline = [
                    { id: 1, title: "Introductie: Het Veranderende Landschap", words: 250 },
                    { id: 2, title: "Het Probleem met Traditionele Content Creatie", words: 400 },
                    { id: 3, title: "Hoe AI het Proces Transformeert", words: 500 },
                    { id: 4, title: "Praktische Toepassingen en Tools", words: 600 },
                    { id: 5, title: "Casestudies: Echte Resultaten", words: 350 },
                    { id: 6, title: "Aan de Slag: Jouw Actieplan", words: 300 },
                    { id: 7, title: "Conclusie en Volgende Stappen", words: 200 },
                ];
                updateContent('blog', {
                    title: contentData.concept.selected?.title || "De Toekomst van Content Creatie met AI",
                    outline: mockOutline,
                    content: `Het landschap van digitale content creatie evolueert in een ongekend tempo. Als creators, marketeers en ondernemers worden we voortdurend uitgedaagd om meer content te produceren op meer platforms, terwijl we kwaliteit en authenticiteit behouden.

In deze uitgebreide gids verkennen we hoe kunstmatige intelligentie de manier waarop we content creatie benaderen aan het hervormen is—niet als vervanging voor menselijke creativiteit, maar als een krachtig hulpmiddel dat onze mogelijkheden versterkt.

## De Uitdaging Waar We Allemaal Mee Te Maken Hebben

Elke content creator kent de strijd: er is nooit genoeg tijd. Tussen ideevorming, onderzoek, schrijven, bewerken en distributie is het creëren van kwaliteitscontent een tijdsintensief proces. En in de huidige multi-platform world moet een enkel stuk content worden aangepast voor YouTube, TikTok, Instagram, LinkedIn en meer.

## De Opkomst van AI-Gestuurde Oplossingen

Moderne AI-tools zijn ontworpen om samen te werken met creators, waarbij ze de repetitieve taken afhandelen die onze tijd opslokken terwijl wij ons kunnen focussen op wat het belangrijkst is: strategie, creativiteit en authentieke verbinding met ons publiek.`,
                    seo: {
                        title: "AI Content Creatie Gids 2026 | Transformeer Je Workflow",
                        description: "Lear hoe AI-tools je kunnen helpen meer content te maken in minder tijd. Uitgebreide gids voor creators en marketeers.",
                        keywords: ["AI content creatie", "content automatisering", "creator tools"]
                    }
                });
            } else {
                const mockOutline = [
                    { id: 1, title: "Introduction: The Changing Landscape", words: 250 },
                    { id: 2, title: "The Problem with Traditional Content Creation", words: 400 },
                    { id: 3, title: "How AI is Transforming the Process", words: 500 },
                    { id: 4, title: "Practical Applications and Tools", words: 600 },
                    { id: 5, title: "Case Studies: Real Results", words: 350 },
                    { id: 6, title: "Getting Started: Your Action Plan", words: 300 },
                    { id: 7, title: "Conclusion and Next Steps", words: 200 },
                ];
                updateContent('blog', {
                    title: contentData.concept.selected?.title || "The Future of Content Creation with AI",
                    outline: mockOutline,
                    content: `The landscape of digital content creation is evolving at an unprecedented pace. As creators, marketers, and entrepreneurs, we're constantly challenged to produce more content across more platforms while maintaining quality and authenticity.

In this comprehensive guide, we'll explore how artificial intelligence is reshaping the way we approach content creation—not as a replacement for human creativity, but as a powerful tool that amplifies our capabilities.

## The Challenge We All Face

Every content creator knows the struggle: there's never enough time. Between ideation, research, writing, editing, and distribution, creating quality content is a time-intensive process. And in today's multi-platform world, a single piece of content needs to be adapted for YouTube, TikTok, Instagram, LinkedIn, and more.

## Enter AI-Powered Solutions

Modern AI tools are designed to work alongside creators, handling the repetitive tasks that consume our time while we focus on what matters most: strategy, creativity, and authentic connection with our audience.`,
                    seo: {
                        title: "AI Content Creation Guide 2026 | Transform Your Workflow",
                        description: "Learn how AI tools can help you create more content in less time. Comprehensive guide for creators and marketers.",
                        keywords: ["AI content creation", "content automation", "creator tools"]
                    }
                });
            }
            setIsGenerating(false);
        }, 2000);
    };

    const totalWords = contentData.blog?.outline?.reduce((sum, s) => sum + s.words, 0) || 0;
    const readingTime = Math.ceil(totalWords / 200);

    return (
        <div className="container-grid cols-center-focus" style={{ height: '100%' }}>
            {/* Container 1: Outline */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <List size={20} style={{ color: 'var(--accent-indigo)' }} />
                        {t('outline')}
                    </h3>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={14} />}
                        {isGenerating ? t('generating') : t('generate')}
                    </button>
                </div>

                <div className="container-body">
                    {contentData.blog?.outline?.length > 0 ? (
                        <div className="flex flex-col gap-sm">
                            {contentData.blog.outline.map((section, i) => (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="card"
                                    style={{
                                        padding: 'var(--space-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)'
                                    }}
                                >
                                    <GripVertical size={16} style={{ color: 'var(--slate-300)', cursor: 'grab' }} />
                                    <div style={{ flex: 1 }}>
                                        <p className="text-small font-medium">{section.title}</p>
                                        <p className="text-caption text-muted">{section.words} {language === 'nl' ? 'woorden' : 'words'}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Add Section Button */}
                            <button
                                className="card"
                                style={{
                                    padding: 'var(--space-md)',
                                    border: '2px dashed var(--slate-200)',
                                    background: 'transparent',
                                    textAlign: 'center',
                                    color: 'var(--slate-400)',
                                    cursor: 'pointer'
                                }}
                            >
                                + {t('add')} {language === 'nl' ? 'Sectie' : 'Section'}
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--slate-400)'
                        }}>
                            <p className="text-small">{language === 'nl' ? 'Klik op Genereer om een outline te maken' : 'Click Generate to create outline'}</p>
                        </div>
                    )}
                </div>

                {contentData.blog?.outline && (
                    <div style={{
                        paddingTop: 'var(--space-md)',
                        borderTop: '1px solid var(--slate-100)',
                        marginTop: 'var(--space-md)'
                    }}>
                        <div className="flex justify-between text-small">
                            <span className="text-muted">{language === 'nl' ? 'Totaal Woorden' : 'Total Words'}</span>
                            <span className="font-medium">{totalWords.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-small" style={{ marginTop: '4px' }}>
                            <span className="text-muted">{language === 'nl' ? 'Leestijd' : 'Reading Time'}</span>
                            <span className="font-medium">{readingTime} min</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Container 2: Blog Editor (Larger) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <FileText size={20} style={{ color: 'var(--primary)' }} />
                        {t('blogEditor')}
                    </h3>
                    {contentData.blog?.content && (
                        <div className="flex gap-md items-center">
                            <span className="text-caption text-muted">
                                <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                {readingTime} min read
                            </span>
                            <span className="badge badge-ai">{t('aiGenerated')}</span>
                        </div>
                    )}
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Title */}
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <input
                            className="input"
                            value={contentData.blog?.title || ''}
                            onChange={(e) => updateContent('blog', { title: e.target.value })}
                            placeholder={language === 'nl' ? 'Artikel Titel...' : "Article Title..."}
                            style={{
                                fontSize: '24px',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 300,
                                border: 'none',
                                padding: 0,
                                background: 'transparent'
                            }}
                        />
                    </div>

                    {/* Content Editor */}
                    <div style={{ flex: 1 }}>
                        <textarea
                            className="textarea"
                            value={contentData.blog?.content || ''}
                            onChange={(e) => updateContent('blog', { content: e.target.value })}
                            placeholder={language === 'nl' ? 'Begin met schrijven...' : "Start writing your blog post..."}
                            style={{
                                height: '100%',
                                minHeight: '400px',
                                resize: 'none',
                                fontSize: '16px',
                                lineHeight: 1.8
                            }}
                        />
                    </div>

                    {/* Word Count & SEO Score */}
                    <div className="flex justify-between items-center" style={{
                        marginTop: 'var(--space-md)',
                        paddingTop: 'var(--space-md)',
                        borderTop: '1px solid var(--slate-100)'
                    }}>
                        <span className="text-caption text-muted">
                            {contentData.blog?.content?.length || 0} characters
                        </span>
                        <div className="flex gap-md items-center">
                            <div className="flex items-center gap-sm">
                                <span className="text-caption">SEO Score:</span>
                                <div style={{
                                    width: '60px',
                                    height: '6px',
                                    background: 'var(--slate-200)',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: '85%',
                                        height: '100%',
                                        background: 'var(--success)',
                                        borderRadius: '3px'
                                    }} />
                                </div>
                                <span className="text-caption" style={{ color: 'var(--success)' }}>85%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Container 3: Blog Settings */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Search size={20} style={{ color: 'var(--accent-coral)' }} />
                        {t('seoSettings')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Featured Image */}
                    <div>
                        <label className="label">
                            <Image size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {language === 'nl' ? 'Uitgelichte Afbeelding' : 'Featured Image'}
                        </label>
                        <div style={{
                            aspectRatio: '16/9',
                            background: contentData.visuals?.hero ? `url(${contentData.visuals.hero}) center/cover` : 'var(--slate-100)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed var(--slate-200)'
                        }}>
                            {!contentData.visuals?.hero && (
                                <button className="btn btn-secondary btn-sm">
                                    {language === 'nl' ? 'Selecteer Afbeelding' : 'Select Image'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                        <label className="label">{t('metaDescription')}</label>
                        <textarea
                            className="textarea"
                            value={contentData.blog?.seo?.description || ''}
                            onChange={(e) => updateContent('blog', {
                                seo: { ...contentData.blog?.seo, description: e.target.value }
                            })}
                            placeholder={language === 'nl' ? 'Korte beschrijving voor zoekmachines...' : "Brief description for search engines..."}
                            style={{ minHeight: '80px' }}
                        />
                        <p className="text-caption text-muted" style={{ marginTop: '4px' }}>
                            {contentData.blog?.seo?.description?.length || 0}/160 characters
                        </p>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="label">
                            <Tag size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {language === 'nl' ? 'Tags & Categorieën' : 'Tags & Categories'}
                        </label>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                            {['AI', 'Content', 'Marketing', 'Tools'].map(tag => (
                                <span key={tag} className="platform-pill active">{tag}</span>
                            ))}
                            <button className="platform-pill" style={{ borderStyle: 'dashed' }}>+ {t('add')}</button>
                        </div>
                    </div>

                    {/* Author */}
                    <div>
                        <label className="label">
                            <User size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {language === 'nl' ? 'Auteur' : 'Author'}
                        </label>
                        <select className="select">
                            <option>{language === 'nl' ? 'Jouw Naam' : 'Your Name'}</option>
                            <option>{language === 'nl' ? 'Team Account' : 'Team Account'}</option>
                        </select>
                    </div>
                </div>

                <div className="container-footer" style={{ flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>
                        <Eye size={16} /> {t('livePreview')}
                    </button>
                </div>
            </div>
        </div>
    );
}
