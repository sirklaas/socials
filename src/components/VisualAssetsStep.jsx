import React, { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon, Wand2, RefreshCw, Download, Check, Settings, Palette } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { generateThreeVisualPromptVariants } from '../services/claude';

const STYLES = [
    { id: 'minimal', name: 'Minimalist', desc: 'Clean and simple' },
    { id: 'bold', name: 'Bold & Vibrant', desc: 'High contrast colors' },
    { id: 'professional', name: 'Professional', desc: 'Corporate look' },
    { id: 'creative', name: 'Creative', desc: 'Artistic and unique' },
];

function buildCardForVisuals(contentData) {
    const sel = contentData.concept?.selected;
    const kp = Array.isArray(sel?.keyPoints) ? sel.keyPoints : [];
    return {
        intro_heading: kp[0] || '',
        sub_heading: kp[1] || '',
        heading: sel?.title || contentData.blog?.title || '',
        body: sel?.description || contentData.blog?.content || '',
    };
}

export default function VisualAssetsStep() {
    const { contentData, updateContent, markStepComplete } = useGlobalContext();
    const { language, t } = useLanguage();
    const [selectedStyle, setSelectedStyle] = useState('minimal');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genClaude, setGenClaude] = useState(false);
    const [claudeErr, setClaudeErr] = useState(null);
    const [localVariantId, setLocalVariantId] = useState(null);

    const variants = contentData.visuals?.claudeVisualVariants;
    const confirmedId = contentData.visuals?.selectedPromptVariantId;

    const briefCard = useMemo(() => buildCardForVisuals(contentData), [contentData]);
    const hasBrief = !!(briefCard.heading?.trim() || briefCard.body?.trim());

    const [prompt, setPrompt] = useState(
        contentData.visuals?.imagePrompts?.main ||
            contentData.concept.selected?.title ||
            'Abstract technology concept with blue and purple gradients',
    );

    useEffect(() => {
        const main = contentData.visuals?.imagePrompts?.main;
        if (main && typeof main === 'string') {
            setPrompt(main);
        }
    }, [contentData.visuals?.imagePrompts?.main]);

    useEffect(() => {
        if (Array.isArray(variants) && variants.length) {
            const idOk =
                confirmedId && variants.some((v) => String(v.id) === String(confirmedId));
            const pick = idOk ? String(confirmedId) : String(variants[0].id);
            setLocalVariantId(pick);
        } else {
            setLocalVariantId(null);
        }
    }, [variants, confirmedId]);

    const styleRows =
        language === 'nl'
            ? [
                  { id: 'minimal', name: 'Minimalistisch', desc: 'Schoon en eenvoudig' },
                  { id: 'bold', name: 'Gewaagd & Levendig', desc: 'Kleuren met hoog contrast' },
                  { id: 'professional', name: 'Professioneel', desc: 'Zakelijke uitstraling' },
                  { id: 'creative', name: 'Creatief', desc: 'Artistiek en uniek' },
              ]
            : STYLES;

    const handleGenClaudeVariants = async () => {
        if (!hasBrief) return;
        setClaudeErr(null);
        setGenClaude(true);
        try {
            const list = await generateThreeVisualPromptVariants({
                card: briefCard,
                seedPrompts: contentData.visuals?.imagePrompts || null,
                visualStyle: selectedStyle,
                lang: language === 'nl' ? 'nl' : 'en',
            });
            updateContent('visuals', {
                claudeVisualVariants: list,
                selectedPromptVariantId: null,
            });
            setLocalVariantId(String(list[0]?.id ?? '1'));
        } catch (e) {
            setClaudeErr(e.message || 'Claude error');
        } finally {
            setGenClaude(false);
        }
    };

    const handleConfirmVariants = () => {
        if (!Array.isArray(variants) || !localVariantId) return;
        const v = variants.find((x) => String(x.id) === String(localVariantId));
        if (!v) return;
        updateContent('visuals', {
            selectedPromptVariantId: String(v.id),
            imagePrompts: {
                main: v.main_image_prompt,
                sub: v.sub_image_prompt || v.main_image_prompt,
            },
        });
        setPrompt(v.main_image_prompt);
        markStepComplete(3);
    };

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
                'https://images.unsplash.com/photo-1634017839464-5c058f151b35?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1633412802994-5c058f151b66?auto=format&fit=crop&q=80&w=800',
            ];
            updateContent('visuals', { hero: mockVisuals[0], variations: mockVisuals });
            setIsGenerating(false);
        }, 2000);
    };

    const selectImage = (img) => {
        updateContent('visuals', { hero: img });
    };

    const selectedVariant = Array.isArray(variants)
        ? variants.find((x) => String(x.id) === String(localVariantId))
        : null;

    return (
        <div className="container-grid cols-settings-gallery" style={{ height: '100%' }}>
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Settings size={20} style={{ color: 'var(--slate-500)' }} />
                        {t('imageSettings')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {!hasBrief && (
                        <p className="text-caption text-muted" style={{ margin: 0 }}>
                            {t('step3NeedsBrief')}
                        </p>
                    )}

                    <div>
                        <label className="label">
                            <Palette size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('visualStyle')}
                        </label>
                        <div className="flex flex-col gap-sm">
                            {styleRows.map((style) => (
                                <div
                                    key={style.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedStyle(style.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && setSelectedStyle(style.id)}
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

                    <div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleGenClaudeVariants}
                            disabled={!hasBrief || genClaude}
                        >
                            {genClaude ? (
                                <>
                                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    {t('step3ClaudeGenerating')}
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    {t('step3GenerateClaudeVariants')}
                                </>
                            )}
                        </button>
                        <p className="text-caption text-muted" style={{ marginTop: '8px' }}>
                            {t('step3ClaudeExplain')}
                        </p>
                    </div>

                    {claudeErr && (
                        <div
                            style={{
                                padding: '8px 10px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--error)',
                                borderRadius: '8px',
                                color: 'var(--error)',
                                fontSize: '12px',
                            }}
                        >
                            {claudeErr}
                        </div>
                    )}

                    <div>
                        <label className="label">{t('imagePrompt')}</label>
                        <textarea
                            className="textarea"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                language === 'nl'
                                    ? 'Hero-prompt (na bevestigen gevuld vanuit gekozen concept)'
                                    : 'Hero prompt (filled from chosen concept after confirm)'
                            }
                            style={{ minHeight: '100px' }}
                        />
                        <p className="text-caption text-muted" style={{ marginTop: '8px' }}>
                            {language === 'nl'
                                ? 'Je kunt de tekst na bevestigen nog handmatig tweaken voor je image-tool.'
                                : 'You can still tweak this manually for your image tool after confirming.'}
                        </p>
                    </div>

                    <details style={{ marginTop: 'auto' }}>
                        <summary
                            style={{
                                cursor: 'pointer',
                                color: 'var(--slate-500)',
                                fontSize: '14px',
                                marginBottom: '12px',
                            }}
                        >
                            {language === 'nl' ? 'Geavanceerde instellingen' : 'Advanced settings'}
                        </summary>
                        <div className="flex flex-col gap-sm">
                            <div>
                                <label className="label">
                                    {language === 'nl' ? 'Beeldverhouding' : 'Aspect ratio'}
                                </label>
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
                        className="btn btn-secondary"
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
                    <p className="text-caption text-muted" style={{ marginTop: 8, textAlign: 'center' }}>
                        {t('step3MockGalleryHint')}
                    </p>
                </div>
            </div>

            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <ImageIcon size={20} style={{ color: 'var(--accent-purple)' }} />
                        {t('step3ClaudeConceptsTitle')}
                    </h3>
                    {String(confirmedId) === String(localVariantId) && selectedVariant && (
                        <span className="text-caption text-muted">{t('step3ConfirmedBadge')}</span>
                    )}
                </div>

                <div className="container-body visual-step-variants">
                    {Array.isArray(variants) && variants.length > 0 ? (
                        <div className="visual-step-variants__grid">
                            {variants.map((v) => {
                                const sel = String(localVariantId) === String(v.id);
                                return (
                                    <button
                                        key={v.id}
                                        type="button"
                                        className={`visual-variant-card${sel ? ' visual-variant-card--selected' : ''}`}
                                        onClick={() => setLocalVariantId(String(v.id))}
                                    >
                                        <div className="visual-variant-card__label">{v.label}</div>
                                        <p className="visual-variant-card__angle">{v.angle}</p>
                                        <div className="visual-variant-card__block">
                                            <span className="visual-variant-card__tag">{t('imagePromptMain')}</span>
                                            <p className="visual-variant-card__text">{v.main_image_prompt}</p>
                                        </div>
                                        <div className="visual-variant-card__block">
                                            <span className="visual-variant-card__tag">{t('imagePromptSub')}</span>
                                            <p className="visual-variant-card__text">{v.sub_image_prompt}</p>
                                        </div>
                                        {sel && (
                                            <div className="visual-variant-card__check">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div
                            style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--slate-400)',
                                textAlign: 'center',
                                padding: '24px',
                            }}
                        >
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '16px',
                                    background: 'var(--slate-100)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 'var(--space-md)',
                                }}
                            >
                                <Wand2 size={32} style={{ color: 'var(--slate-300)' }} />
                            </div>
                            <p className="font-heading" style={{ fontSize: '18px', color: 'var(--slate-500)', marginBottom: '8px' }}>
                                {t('step3NoVariantsYet')}
                            </p>
                            <p className="text-small text-muted">{t('step3NoVariantsHint')}</p>
                        </div>
                    )}
                </div>

                {Array.isArray(variants) && variants.length > 0 && (
                    <div className="container-footer" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={!localVariantId}
                            onClick={handleConfirmVariants}
                        >
                            <Check size={18} />
                            {t('step3ConfirmVisualPrompts')}
                        </button>
                    </div>
                )}

                {contentData.visuals.variations?.length > 0 && (
                    <>
                        <div className="container-header" style={{ borderTop: '1px solid var(--slate-100)', paddingTop: 16 }}>
                            <h3 className="container-title">
                                <ImageIcon size={20} style={{ color: 'var(--slate-500)' }} />
                                {t('generatedImages')}
                            </h3>
                            <div className="flex gap-sm">
                                <button type="button" className="btn btn-secondary btn-sm">
                                    <Download size={14} /> {language === 'nl' ? 'Alles downloaden' : 'Download all'}
                                </button>
                            </div>
                        </div>
                        <div className="container-body">
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 'var(--space-md)',
                                }}
                            >
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
                                            border:
                                                contentData.visuals.hero === img
                                                    ? '3px solid var(--primary)'
                                                    : '2px solid transparent',
                                            boxShadow:
                                                contentData.visuals.hero === img ? 'var(--shadow-primary)' : 'none',
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Option ${i + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {contentData.visuals.hero === img && (
                                            <div
                                                style={{
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
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="container-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleGenerate}>
                                <RefreshCw size={16} /> {t('regenerate')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
