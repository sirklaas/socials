import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, RefreshCw, Download, Check, Settings, Palette, Maximize2 } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { motion } from 'framer-motion';

const STYLES = [
    { id: 'minimal', name: 'Minimalist', desc: 'Clean and simple' },
    { id: 'bold', name: 'Bold & Vibrant', desc: 'High contrast colors' },
    { id: 'professional', name: 'Professional', desc: 'Corporate look' },
    { id: 'creative', name: 'Creative', desc: 'Artistic and unique' },
];

export default function VisualAssetsStep() {
    const { contentData, updateContent } = useGlobalContext();
    const { language, t } = useLanguage();
    const [selectedStyle, setSelectedStyle] = useState('minimal');
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState(contentData.concept.selected?.title || 'Abstract technology concept with blue and purple gradients');

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const mockVisuals = [
                'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1633412802994-5c058f151b66?auto=format&fit=crop&q=80&w=800',
            ];
            updateContent('visuals', { hero: mockVisuals[0], variations: mockVisuals });
            setIsGenerating(false);
        }, 2000);
    };

    const selectImage = (img) => {
        updateContent('visuals', { hero: img });
    };

    return (
        <div className="container-grid cols-settings-gallery" style={{ height: '100%' }}>
            {/* Left Container: Settings (40%) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Settings size={20} style={{ color: 'var(--slate-500)' }} />
                        {t('imageSettings')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Platform Selector */}
                    <div>
                        <label className="label">{t('platform')}</label>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                            {['YouTube', 'Instagram', 'TikTok', 'LinkedIn'].map(p => (
                                <button key={p} className="platform-pill active">
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Style Dropdown */}
                    <div>
                        <label className="label">
                            <Palette size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('visualStyle')}
                        </label>
                        <div className="flex flex-col gap-sm">
                            {(language === 'nl' ? [
                                { id: 'minimal', name: 'Minimalistisch', desc: 'Schoon en eenvoudig' },
                                { id: 'bold', name: 'Gewaagd & Levendig', desc: 'Kleuren met hoog contrast' },
                                { id: 'professional', name: 'Professioneel', desc: 'Zakelijke uitstraling' },
                                { id: 'creative', name: 'Creatief', desc: 'Artistiek en uniek' },
                            ] : STYLES).map(style => (
                                <div
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`card ${selectedStyle === style.id ? 'selected' : ''}`}
                                    style={{ padding: 'var(--space-md)', cursor: 'pointer' }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-small font-medium">{style.name}</p>
                                            <p className="text-caption text-muted">{style.desc}</p>
                                        </div>
                                        {selectedStyle === style.id && (
                                            <Check size={16} style={{ color: 'var(--primary)' }} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prompt Input */}
                    <div>
                        <label className="label">{t('imagePrompt')}</label>
                        <textarea
                            className="textarea"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={language === 'nl' ? 'Beschrijf de afbeelding die je wilt...' : 'Describe the image you want...'}
                            style={{ minHeight: '100px' }}
                        />
                        <p className="text-caption text-muted" style={{ marginTop: '8px' }}>
                            {language === 'nl' ? 'Tip: Wees specifiek over kleuren, sfeer en compositie' : 'Tip: Be specific about colors, mood, and composition'}
                        </p>
                    </div>

                    {/* Advanced Settings */}
                    <details style={{ marginTop: 'auto' }}>
                        <summary style={{
                            cursor: 'pointer',
                            color: 'var(--slate-500)',
                            fontSize: '14px',
                            marginBottom: '12px'
                        }}>
                            {language === 'nl' ? 'Geavanceerde Instellingen' : 'Advanced Settings'}
                        </summary>
                        <div className="flex flex-col gap-sm">
                            <div>
                                <label className="label">{language === 'nl' ? 'Beeldverhouding' : 'Aspect Ratio'}</label>
                                <select className="select">
                                    <option>16:9 (Landscape)</option>
                                    <option>9:16 (Portrait)</option>
                                    <option>1:1 (Square)</option>
                                    <option>4:5 (Instagram)</option>
                                </select>
                            </div>
                        </div>
                    </details>
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
                                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                {t('generating')}
                            </>
                        ) : (
                            <>
                                <Wand2 size={18} />
                                {t('generateImages')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Container: Image Gallery (60%) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <ImageIcon size={20} style={{ color: 'var(--accent-purple)' }} />
                        {t('generatedImages')}
                    </h3>
                    {contentData.visuals.variations?.length > 0 && (
                        <div className="flex gap-sm">
                            <button className="btn btn-secondary btn-sm">
                                <Download size={14} /> {language === 'nl' ? 'Alles Downloaden' : 'Download All'}
                            </button>
                            <button className="btn btn-ghost btn-sm">
                                {language === 'nl' ? 'Eigen Uploaden' : 'Upload Custom'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="container-body">
                    {contentData.visuals.variations?.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 'var(--space-md)',
                            height: '100%'
                        }}>
                            {contentData.visuals.variations.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => selectImage(img)}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: contentData.visuals.hero === img ? '3px solid var(--primary)' : '2px solid transparent',
                                        boxShadow: contentData.visuals.hero === img ? 'var(--shadow-primary)' : 'none'
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`Option ${i + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {/* Hover Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                    >
                                        <button className="btn btn-primary btn-sm">
                                            <Check size={14} /> {t('select')}
                                        </button>
                                    </div>
                                    {/* Selected Badge */}
                                    {contentData.visuals.hero === img && (
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
                                <ImageIcon size={40} style={{ color: 'var(--slate-300)' }} />
                            </div>
                            <p className="font-heading" style={{ fontSize: '20px', color: 'var(--slate-500)', marginBottom: '8px' }}>
                                {t('noImages')}
                            </p>
                            <p className="text-small text-muted">
                                {language === 'nl' ? 'Configureer je instellingen en klik op "Genereer Afbeeldingen" om visuele assets te maken' : 'Configure your settings and click "Generate Images" to create visual assets'}
                            </p>
                        </div>
                    )}
                </div>

                {contentData.visuals.variations?.length > 0 && (
                    <div className="container-footer">
                        <button className="btn btn-secondary" onClick={handleGenerate}>
                            <RefreshCw size={16} /> {t('regenerate')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
