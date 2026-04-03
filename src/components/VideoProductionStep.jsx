import React, { useState } from 'react';
import { Video, Play, Music, Mic, RefreshCw, Wand2, Clock, Settings, Youtube, Smartphone, Monitor } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export default function VideoProductionStep() {
    const { contentData, updateContent } = useGlobalContext();
    const { language, t } = useLanguage();
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeFormat, setActiveFormat] = useState('youtube');

    const handleGenerateScript = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const mockScenes = language === 'nl' ? [
                { id: 1, text: "Hook: Trek de aandacht met een gedurfde uitspraak over AI en content creatie.", duration: "0:00 - 0:05", type: "Hook" },
                { id: 2, text: "Probleem: Bespreek de uitdagingen waarmee creators te maken hebben bij het opschalen van content.", duration: "0:05 - 0:20", type: "Probleem" },
                { id: 3, text: "Oplossing: Introduceer AI-tools die repetitieve taken automatiseren.", duration: "0:20 - 0:45", type: "Oplossing" },
                { id: 4, text: "Demo: Toon de workflow in actie met schermopnames.", duration: "0:45 - 1:30", type: "Demo" },
                { id: 5, text: "Resultaten: Deel casestudies en succesmetrieken.", duration: "1:30 - 2:00", type: "Bewijs" },
                { id: 6, text: "CTA: Nodig kijkers uit om het zelf te proberen met link in bio.", duration: "2:00 - 2:15", type: "CTA" },
            ] : [
                { id: 1, text: "Hook: Capture attention with a bold statement about AI and content creation.", duration: "0:00 - 0:05", type: "Hook" },
                { id: 2, text: "Problem: Discuss the challenges creators face when scaling content.", duration: "0:05 - 0:20", type: "Problem" },
                { id: 3, text: "Solution: Introduce AI-powered tools that automate repetitive tasks.", duration: "0:20 - 0:45", type: "Solution" },
                { id: 4, text: "Demo: Show the workflow in action with screen recordings.", duration: "0:45 - 1:30", type: "Demo" },
                { id: 5, text: "Results: Share case studies and success metrics.", duration: "1:30 - 2:00", type: "Proof" },
                { id: 6, text: "CTA: Invite viewers to try it themselves with link in bio.", duration: "2:00 - 2:15", type: "CTA" },
            ];

            const script = language === 'nl'
                ? "De toekomst van content creatie gaat niet over harder werken—het gaat over slimmer werken. Vandaag laat ik je precies zien hoe AI-tools je kunnen helpen meer content te maken in minder tijd, zonder kwaliteit op te offeren."
                : "The future of content creation isn't about working harder—it's about working smarter. Today, I'm going to show you exactly how AI tools can help you create more content in less time, without sacrificing quality.";

            updateContent('video', { script, scenes: mockScenes });
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="container-grid cols-3" style={{ height: '100%' }}>
            {/* Container 1: Script */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Video size={20} style={{ color: 'var(--accent-coral)' }} />
                        {t('videoScript')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Script Outline */}
                    <div style={{ flex: 1 }}>
                        <label className="label">{t('sceneBreakdown')}</label>
                        <div className="flex flex-col gap-sm">
                            {contentData.video?.scenes?.map((scene, i) => (
                                <motion.div
                                    key={scene.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="card"
                                    style={{ padding: 'var(--space-md)' }}
                                >
                                    <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                                        <span className="badge badge-ai">{scene.type}</span>
                                        <span className="text-caption text-muted">
                                            <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            {scene.duration}
                                        </span>
                                    </div>
                                    <p className="text-small" style={{ color: 'var(--slate-700)' }}>
                                        {scene.text}
                                    </p>
                                </motion.div>
                            )) || (
                                    <div style={{
                                        padding: 'var(--space-2xl)',
                                        textAlign: 'center',
                                        color: 'var(--slate-400)'
                                    }}>
                                        <p className="text-small">{t('noContent')}</p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Timeline Visual */}
                    {contentData.video?.scenes && (
                        <div>
                            <label className="label">{language === 'nl' ? 'Tijdlijn' : 'Timeline'}</label>
                            <div style={{
                                display: 'flex',
                                gap: '2px',
                                height: '32px',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                {contentData.video.scenes.map((scene, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            background: `hsl(${220 + i * 20}, 70%, ${60 - i * 5}%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title={scene.type}
                                    >
                                        <span style={{ fontSize: '10px', color: 'white', fontWeight: 500 }}>
                                            {i + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Container 2: Video Settings */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Settings size={20} style={{ color: 'var(--slate-500)' }} />
                        {t('videoSettings')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Platform Selector */}
                    <div>
                        <label className="label">{t('platformFormat')}</label>
                        <div className="flex gap-sm">
                            {[
                                { id: 'youtube', name: 'YouTube', icon: Youtube },
                                { id: 'tiktok', name: 'TikTok', icon: Smartphone },
                                { id: 'reels', name: 'Reels', icon: Monitor }
                            ].map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveFormat(p.id)}
                                    className={`platform-pill ${activeFormat === p.id ? 'active' : ''}`}
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    <p.icon size={14} />
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="label">{t('targetDuration')}</label>
                        <select className="select">
                            <option>{language === 'nl' ? 'Onder 60 seconden (Kort)' : 'Under 60 seconds (Short)'}</option>
                            <option>{language === 'nl' ? '1-3 minuten (Gemiddeld)' : '1-3 minutes (Medium)'}</option>
                            <option>{language === 'nl' ? '5-10 minuten (Lang)' : '5-10 minutes (Long)'}</option>
                            <option>{language === 'nl' ? '10+ minuten (Uitgebreid)' : '10+ minutes (Extended)'}</option>
                        </select>
                    </div>

                    {/* B-Roll Style */}
                    <div>
                        <label className="label">{language === 'nl' ? 'B-Roll Stijl' : 'B-Roll Style'}</label>
                        <select className="select">
                            <option>{language === 'nl' ? 'Dynamische stockbeelden' : 'Dynamic stock footage'}</option>
                            <option>{language === 'nl' ? 'Schermopnames' : 'Screen recordings'}</option>
                            <option>{language === 'nl' ? 'Geanimeerde graphics' : 'Animated graphics'}</option>
                            <option>{language === 'nl' ? 'Gemengde media' : 'Mixed media'}</option>
                        </select>
                    </div>

                    {/* Music */}
                    <div>
                        <label className="label">
                            <Music size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('backgroundMusic')}
                        </label>
                        <div className="flex flex-col gap-sm">
                            {(language === 'nl' ? ['Vrolijk & Energiek', 'Rustig & Professioneel', 'Cinematisch', 'Geen Muziek'] : ['Upbeat & Energetic', 'Calm & Professional', 'Cinematic', 'No Music']).map((m, i) => (
                                <div key={i} className="card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                                    <div className="flex items-center gap-sm">
                                        <input type="radio" name="music" id={`music-${i}`} defaultChecked={i === 0} />
                                        <label htmlFor={`music-${i}`} className="text-small">{m}</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Voice */}
                    <div>
                        <label className="label">
                            <Mic size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('voiceover')}
                        </label>
                        <select className="select">
                            <option>{language === 'nl' ? 'AI Stem - Man (Professioneel)' : 'AI Voice - Male (Professional)'}</option>
                            <option>{language === 'nl' ? 'AI Stem - Vrouw (Vriendelijk)' : 'AI Voice - Female (Friendly)'}</option>
                            <option>{language === 'nl' ? 'Geen voice-over (Alleen muziek)' : 'No voiceover (Music only)'}</option>
                            <option>{language === 'nl' ? 'Eigen opname uploaden' : 'Upload custom recording'}</option>
                        </select>
                    </div>
                </div>

                <div className="container-footer">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateScript}
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
                                {t('generateVideo')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Container 3: Video Preview */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Play size={20} style={{ color: 'var(--primary)' }} />
                        {t('videoPreview')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Video Player Placeholder */}
                    <div style={{
                        aspectRatio: activeFormat === 'youtube' ? '16/9' : '9/16',
                        maxHeight: activeFormat === 'youtube' ? '300px' : '400px',
                        background: 'var(--slate-950)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                    }}>
                        {contentData.video?.scenes ? (
                            <button style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Play size={28} style={{ color: 'white', marginLeft: '4px' }} />
                            </button>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--slate-500)' }}>
                                <Video size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p className="text-small">{language === 'nl' ? 'Geen voorbeeld beschikbaar' : 'No preview available'}</p>
                            </div>
                        )}
                    </div>

                    {/* Subtitle Toggle */}
                    {contentData.video?.scenes && (
                        <div className="flex justify-between items-center" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--slate-50)',
                            borderRadius: '8px'
                        }}>
                            <span className="text-small">{language === 'nl' ? 'Ondertiteling tonen' : 'Show Subtitles'}</span>
                            <label style={{ position: 'relative', width: '44px', height: '24px' }}>
                                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    inset: 0,
                                    background: 'var(--primary)',
                                    borderRadius: '24px',
                                    transition: '0.3s'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        height: '18px',
                                        width: '18px',
                                        left: '22px',
                                        bottom: '3px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: '0.3s'
                                    }} />
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Format Selector */}
                    {contentData.video?.scenes && (
                        <div>
                            <label className="label">{language === 'nl' ? 'Export Formaten' : 'Export Formats'}</label>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {['16:9', '9:16', '1:1', '4:5'].map(f => (
                                    <button key={f} className="platform-pill">
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {contentData.video?.scenes && (
                    <div className="container-footer">
                        <button className="btn btn-secondary" onClick={handleGenerateScript}>
                            <RefreshCw size={16} /> {t('regenerate')}
                        </button>
                        <button className="btn btn-primary">
                            {language === 'nl' ? 'Video Downloaden' : 'Download Video'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
