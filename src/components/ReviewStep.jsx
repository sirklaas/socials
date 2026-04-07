import React, { useState } from 'react';
import { CheckCircle, Eye, Youtube, Instagram, Linkedin, Smartphone, Globe, Check, AlertCircle, Edit, LayoutGrid, Maximize2 } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const PLATFORMS = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'tiktok', name: 'TikTok', icon: Smartphone, color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { id: 'blog', name: 'Blog', icon: Globe, color: '#2563EB' },
];

export default function ReviewStep() {
    const { contentData } = useGlobalContext();
    const { language, t } = useLanguage();
    const [viewMode, setViewMode] = useState('grid');
    const [selectedPlatform, setSelectedPlatform] = useState('youtube');

    const checklistItems = [
        { id: 'text', label: language === 'nl' ? 'Tekstinhoud goedgekeurd' : 'Text content approved', done: !!contentData.platforms.youtube?.body },
        { id: 'images', label: language === 'nl' ? 'Afbeeldingen geselecteerd' : 'Images selected', done: !!contentData.visuals?.hero },
        { id: 'video', label: language === 'nl' ? 'Videoscript gereed' : 'Video script ready', done: !!contentData.video?.scenes },
        { id: 'hashtags', label: language === 'nl' ? 'Hashtags toegevoegd' : 'Hashtags added', done: contentData.platforms.youtube?.hashtags?.length > 0 },
        { id: 'blog', label: language === 'nl' ? 'Blogbericht voltooid' : 'Blog post complete', done: !!contentData.blog?.content },
        { id: 'thumbnails', label: language === 'nl' ? 'Thumbnails geselecteerd' : 'Thumbnails selected', done: !!contentData.visuals?.thumbnails },
    ];

    const completedCount = checklistItems.filter(i => i.done).length;

    return (
        <div className="container-grid cols-settings-gallery" style={{ height: '100%' }}>
            {/* Left Container: Checklist (30%) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                        {t('contentChecklist')}
                    </h3>
                    <span className="badge badge-completed">{completedCount}/{checklistItems.length}</span>
                </div>

                <div className="container-body">
                    <div className="flex flex-col gap-sm">
                        {checklistItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-md"
                                style={{
                                    padding: 'var(--space-md)',
                                    background: item.done ? 'var(--primary-ultralight)' : 'var(--slate-50)',
                                    borderRadius: '8px',
                                    border: `1px solid ${item.done ? 'var(--primary-light)' : 'var(--slate-200)'}`
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: item.done ? 'var(--primary)' : 'var(--slate-200)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.done ? (
                                        <Check size={14} style={{ color: 'white' }} />
                                    ) : (
                                        <span style={{ color: 'var(--slate-400)', fontSize: '12px' }}>—</span>
                                    )}
                                </div>
                                <span className={`text-small ${item.done ? 'font-medium' : 'text-muted'}`}>
                                    {item.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Platform Toggles */}
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        <label className="label">{t('platformsToPublish')}</label>
                        <div className="flex flex-col gap-sm">
                            {PLATFORMS.map(p => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between"
                                    style={{
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: 'var(--slate-50)',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <div className="flex items-center gap-sm">
                                        <p.icon size={16} style={{ color: p.color }} />
                                        <span className="text-small">{p.name}</span>
                                    </div>
                                    <label style={{ position: 'relative', width: '40px', height: '22px' }}>
                                        <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                                        <span style={{
                                            position: 'absolute',
                                            cursor: 'pointer',
                                            inset: 0,
                                            background: 'var(--primary)',
                                            borderRadius: '22px',
                                            transition: '0.3s'
                                        }}>
                                            <span style={{
                                                position: 'absolute',
                                                height: '16px',
                                                width: '16px',
                                                left: '20px',
                                                bottom: '3px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                transition: '0.3s'
                                            }} />
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container-footer" style={{ flexDirection: 'column' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={completedCount < checklistItems.length}
                    >
                        <Check size={16} /> {t('approveContinue')}
                    </button>
                </div>
            </div>

            {/* Right Container: Multi-Platform Preview (70%) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Eye size={20} style={{ color: 'var(--accent-purple)' }} />
                        {t('platformPreviews')}
                    </h3>
                    <div className="flex gap-sm">
                        <button
                            className={`platform-pill ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={14} /> {language === 'nl' ? 'Raster' : 'Grid'}
                        </button>
                        <button
                            className={`platform-pill ${viewMode === 'single' ? 'active' : ''}`}
                            onClick={() => setViewMode('single')}
                        >
                            <Maximize2 size={14} /> {language === 'nl' ? 'Focus' : 'Focus'}
                        </button>
                    </div>
                </div>

                <div className="container-body">
                    {viewMode === 'grid' ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 'var(--space-md)',
                            height: '100%'
                        }}>
                            {PLATFORMS.slice(0, 6).map((platform, i) => {
                                const data = platform.id === 'blog' ? contentData.blog : contentData.platforms[platform.id];
                                const hasData = data && (data.body || data.content);

                                return (
                                    <motion.div
                                        key={platform.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => {
                                            setSelectedPlatform(platform.id);
                                            setViewMode('single');
                                        }}
                                        className="card"
                                        style={{
                                            padding: 0,
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {/* Preview Image */}
                                        <div style={{
                                            height: '120px',
                                            background: contentData.visuals?.hero
                                                ? `url(${contentData.visuals.hero}) center/cover`
                                                : 'var(--slate-100)',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                background: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <platform.icon size={12} style={{ color: platform.color }} />
                                                <span className="text-caption">{platform.name}</span>
                                            </div>
                                        </div>

                                        {/* Content Preview */}
                                        <div style={{ padding: 'var(--space-md)', flex: 1 }}>
                                            <p className="text-small font-medium" style={{
                                                marginBottom: '4px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {data?.title || (language === 'nl' ? 'Geen titel' : 'No title')}
                                            </p>
                                            <p className="text-caption text-muted" style={{
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {(platform.id === 'blog' ? data?.content : data?.body)?.substring(0, 100) || (language === 'nl' ? 'Nog geen inhoud' : 'No content yet')}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div style={{
                                            padding: 'var(--space-sm) var(--space-md)',
                                            borderTop: '1px solid var(--slate-100)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            {hasData ? (
                                                <span className="text-caption" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Check size={12} /> {language === 'nl' ? 'Gereed' : 'Ready'}
                                                </span>
                                            ) : (
                                                <span className="text-caption" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertCircle size={12} /> {language === 'nl' ? 'Incompleet' : 'Incomplete'}
                                                </span>
                                            )}
                                            <button style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--primary)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '12px'
                                            }}>
                                                <Edit size={12} /> {language === 'nl' ? 'Bewerken' : 'Edit'}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Platform Tabs */}
                            <div className="flex gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
                                {PLATFORMS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPlatform(p.id)}
                                        className={`platform-pill ${selectedPlatform === p.id ? 'active' : ''}`}
                                    >
                                        <p.icon size={14} />
                                        {p.name}
                                    </button>
                                ))}
                            </div>

                            {/* Large Preview */}
                            <div style={{
                                flex: 1,
                                background: 'var(--slate-950)',
                                borderRadius: '12px',
                                padding: 'var(--space-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    maxWidth: '400px',
                                    boxShadow: 'var(--shadow-lg)'
                                }}>
                                    {contentData.visuals?.hero && (
                                        <img
                                            src={contentData.visuals.hero}
                                            alt="Preview"
                                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div style={{ padding: 'var(--space-lg)' }}>
                                        <p className="font-medium" style={{ marginBottom: '8px' }}>
                                            {contentData.platforms[selectedPlatform]?.title || (language === 'nl' ? 'Geen titel' : 'No title')}
                                        </p>
                                        <p className="text-small text-muted">
                                            {contentData.platforms[selectedPlatform]?.body?.substring(0, 150) || (language === 'nl' ? 'Geen inhoud' : 'No content')}...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
