import React, { useState } from 'react';
import { Frame, Wand2, RefreshCw, Check, Type, Palette, Settings, Download, Eye, Sparkles } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export default function ThumbnailStep() {
    const { contentData, updateContent } = useGlobalContext();
    const { language, t } = useLanguage();
    const [isGenerating, setIsGenerating] = useState(false);
    const [textOverlay, setTextOverlay] = useState(contentData.concept.selected?.title || (language === 'nl' ? 'Jouw Titel Hier' : 'Your Title Here'));
    const [selectedThumbnail, setSelectedThumbnail] = useState(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const mockThumbnails = [
                'https://images.unsplash.com/photo-1626544823126-649019670732?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?auto=format&fit=crop&q=80&w=800',
            ];
            updateContent('visuals', { thumbnails: mockThumbnails });
            setSelectedThumbnail(mockThumbnails[0]);
            setIsGenerating(false);
        }, 1500);
    };

    const colorSchemes = [
        { name: language === 'nl' ? 'Levendig' : 'Vibrant', colors: ['#FF6B6B', '#4ECDC4'] },
        { name: language === 'nl' ? 'Donker' : 'Dark', colors: ['#2C3E50', '#8E44AD'] },
        { name: language === 'nl' ? 'Licht' : 'Light', colors: ['#F8F9FA', '#2563EB'] },
        { name: language === 'nl' ? 'Warm' : 'Warm', colors: ['#F59E0B', '#EF4444'] }
    ];

    return (
        <div className="container-grid cols-settings-gallery" style={{ height: '100%' }}>
            {/* Left Container: Settings (35%) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Settings size={20} style={{ color: 'var(--slate-500)' }} />
                        {t('thumbnailSettings')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Platform Selector */}
                    <div>
                        <label className="label">{t('platform')}</label>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                            {['YouTube', 'TikTok', 'Instagram'].map(p => (
                                <button key={p} className="platform-pill active">
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Overlay */}
                    <div>
                        <label className="label">
                            <Type size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('textOverlay')}
                        </label>
                        <textarea
                            className="textarea"
                            value={textOverlay}
                            onChange={(e) => setTextOverlay(e.target.value)}
                            placeholder={language === 'nl' ? 'Hoofdtekst voor thumbnail...' : "Main text for thumbnail..."}
                            style={{ minHeight: '80px' }}
                        />
                    </div>

                    {/* Font Style */}
                    <div>
                        <label className="label">{t('fontStyle')}</label>
                        <select className="select">
                            <option>{language === 'nl' ? 'Dik Gedrukt' : 'Bold Impact'}</option>
                            <option>{language === 'nl' ? 'Strak Sans' : 'Clean Sans'}</option>
                            <option>{language === 'nl' ? 'Elegant Script' : 'Script Elegant'}</option>
                            <option>{language === 'nl' ? 'Modern Tech' : 'Tech Modern'}</option>
                        </select>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="label">
                            <Palette size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('colorScheme')}
                        </label>
                        <div className="flex gap-sm">
                            {colorSchemes.map((scheme, i) => (
                                <div
                                    key={i}
                                    className="card"
                                    style={{
                                        padding: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {scheme.colors.map((c, j) => (
                                            <div key={j} style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '4px',
                                                background: c
                                            }} />
                                        ))}
                                    </div>
                                    <span className="text-caption">{scheme.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Face Detection */}
                    <div className="flex justify-between items-center" style={{
                        padding: 'var(--space-md)',
                        background: 'var(--slate-50)',
                        borderRadius: '8px'
                    }}>
                        <div>
                            <p className="text-small font-medium">{language === 'nl' ? 'Gezichtsdetectie' : 'Face Detection'}</p>
                            <p className="text-caption text-muted">{language === 'nl' ? 'Automatische tekstplaatsing' : 'Auto-position text around faces'}</p>
                        </div>
                        <label style={{ position: 'relative', width: '44px', height: '24px' }}>
                            <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                inset: 0,
                                background: 'var(--primary)',
                                borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    height: '18px',
                                    width: '18px',
                                    left: '22px',
                                    bottom: '3px',
                                    background: 'white',
                                    borderRadius: '50%'
                                }} />
                            </span>
                        </label>
                    </div>
                </div>

                <div className="container-footer">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        style={{ width: '100%' }}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                                {t('generating')}
                            </>
                        ) : (
                            <>
                                <Wand2 size={18} />
                                {t('generateThumbnails')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Container: Thumbnail Gallery (65%) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Frame size={20} style={{ color: 'var(--accent-purple)' }} />
                        {t('thumbnailVariations')}
                    </h3>
                    {contentData.visuals?.thumbnails?.length > 0 && (
                        <span className="badge badge-ai">
                            <Sparkles size={12} style={{ marginRight: '4px' }} />
                            {t('aiGenerated')}
                        </span>
                    )}
                </div>

                <div className="container-body">
                    {contentData.visuals?.thumbnails?.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gridTemplateRows: 'repeat(2, 1fr)',
                            gap: 'var(--space-md)',
                            height: '100%'
                        }}>
                            {contentData.visuals.thumbnails.map((thumb, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedThumbnail(thumb)}
                                    style={{
                                        position: 'relative',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedThumbnail === thumb ? '3px solid var(--primary)' : '2px solid transparent',
                                        boxShadow: selectedThumbnail === thumb ? 'var(--shadow-primary)' : 'var(--shadow-sm)'
                                    }}
                                >
                                    <img
                                        src={thumb}
                                        alt={`Thumbnail ${i + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {/* Text Overlay Preview */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        left: '12px',
                                        right: '12px',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {textOverlay.substring(0, 30)}...
                                    </div>
                                    {/* Selected Badge */}
                                    {selectedThumbnail === thumb && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Check size={16} />
                                        </div>
                                    )}
                                    {/* A/B Test Label */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        left: '8px',
                                        background: 'var(--accent-amber)',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 600
                                    }}>
                                        {['A', 'B', 'C', 'D', 'E', 'F'][i]}
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
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '16px',
                                background: 'var(--slate-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--space-lg)'
                            }}>
                                <Frame size={40} style={{ color: 'var(--slate-300)' }} />
                            </div>
                            <p className="font-heading" style={{ fontSize: '20px', color: 'var(--slate-500)', marginBottom: '8px' }}>
                                {language === 'nl' ? 'Nog geen thumbnails' : 'No thumbnails yet'}
                            </p>
                            <p className="text-small text-muted">
                                {language === 'nl' ? 'Configureer je instellingen en genereer thumbnail variaties' : 'Configure your settings and generate thumbnail variations'}
                            </p>
                        </div>
                    )}
                </div>

                {contentData.visuals?.thumbnails?.length > 0 && (
                    <div className="container-footer">
                        <button className="btn btn-secondary">
                            <Eye size={16} /> {t('preview')}
                        </button>
                        <button className="btn btn-secondary">
                            <Download size={16} /> {t('download')}
                        </button>
                        <button className="btn btn-primary" disabled={!selectedThumbnail}>
                            {language === 'nl' ? 'Geselecteerde Goedkeuren' : 'Approve Selected'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
