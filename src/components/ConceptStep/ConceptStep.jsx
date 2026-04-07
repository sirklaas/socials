import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, Check, Wand2, Newspaper, TrendingUp, Heart, UploadCloud } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';
import { useLanguage } from '../../context/LanguageContext';
import { generateIdeaConceptCards, generateImagePromptsForChannel } from '../../services/claude';
import { fetchNewsTopics, fetchSocialTopics } from '../../services/topicSources';
import { loadPinkmilkTopicsInitial, regeneratePinkmilkTopics } from '../../services/pinkmilkTopics';
import { CHANNEL_DEFS } from '../../constants/channels';
import TopicColumn from './TopicColumn';

const FALLBACK_NEWS = [
    { id: 'fn-1', source: 'Demo', title: 'Streamingdienst kondigt nieuw NL-kijkersrecord aan', summary: 'Quoten pieken door docu-serie en live-evenement.\nSocial praat mee met hashtags en clips.', url: '#' },
    { id: 'fn-2', source: 'Demo', title: 'Festivals plannen extra data voor 2026', summary: 'Meer podia en kindvriendelijke zones.\nKaartverkoop start volgende maand.', url: '#' },
    { id: 'fn-3', source: 'Demo', title: 'Actrice deelt eerste beelden van speelfilm', summary: 'Teaser trekt miljoenen views.\nRelease in de zomer.', url: '#' },
    { id: 'fn-4', source: 'Demo', title: 'Late night show nodigt cabaretier uit', summary: 'Fragment gaat viraal op short video.\nNieuwe aflevering komende vrijdag.', url: '#' },
    { id: 'fn-5', source: 'Demo', title: 'Radio-hit stijgt naar nummer 1 in airplay-lijst', summary: 'Collaboratie tussen producer en zangeres.\nTourdata worden binnenkort bekend.', url: '#' },
];

const FALLBACK_SOCIAL = [
    { id: 'fs-1', source: 'Demo', title: 'YouTube trending: trailer nieuwe speelfilm', summary: 'Trailer trekt views in NL.\nReaction- en breakdown-content volgt.', url: '#fs-1' },
    { id: 'fs-2', source: 'Demo', title: 'YouTube trending: festival-aftermovie', summary: 'Highlights en backstage clips.\nMuziek en experience merken.', url: '#fs-2' },
    { id: 'fs-3', source: 'Demo', title: 'YouTube trending: challenge-video', summary: 'Korte format met duel tussen creators.\nDuets en stitches op andere platforms.', url: '#fs-3' },
    { id: 'fs-4', source: 'Demo', title: 'YouTube trending: tech-unboxing', summary: 'Gadget-release met live Q&A.\nCommentsectie stuurt koopbeslissingen.', url: '#fs-4' },
    { id: 'fs-5', source: 'Demo', title: 'YouTube trending: podcast-clip', summary: 'Fragment gaat viral.\nLangere aflevering in beschrijving gelinkt.', url: '#fs-5' },
];

export default function ConceptStep() {
    const {
        contentData,
        updateIdeaFlow,
        updateContent,
        confirmStep1Blog,
        markStepComplete,
        currentRecordId,
        forceSave,
        isSaving,
    } = useGlobalContext();
    const { language, t } = useLanguage();
    const idea = contentData.concept.ideaFlow || {};

    const [loadNews, setLoadNews] = useState(false);
    const [loadSocial, setLoadSocial] = useState(false);
    const [loadPm, setLoadPm] = useState(false);
    const [genCards, setGenCards] = useState(false);
    const [genBlogImg, setGenBlogImg] = useState(false);
    const [claudeErr, setClaudeErr] = useState(null);
    const [pbSyncErr, setPbSyncErr] = useState(null);
    const [pbInfo, setPbInfo] = useState(null);
    const loadInProgress = useRef(false);

    const loadInitial = useCallback(async () => {
        if (loadInProgress.current) return;
        loadInProgress.current = true;
        try {
            setLoadNews(true);
            setLoadSocial(true);
            setLoadPm(true);

            try {
                const newsRes = await fetchNewsTopics({}).catch(() => null);
                if (newsRes?.ok && newsRes.topics?.length) {
                    updateIdeaFlow({ newsTopics: newsRes.topics });
                } else {
                    updateIdeaFlow({ newsTopics: FALLBACK_NEWS });
                }
            } catch {
                updateIdeaFlow({ newsTopics: FALLBACK_NEWS });
            } finally {
                setLoadNews(false);
            }

            try {
                const socRes = await fetchSocialTopics({}).catch(() => null);
                if (socRes?.ok && socRes.topics?.length) {
                    updateIdeaFlow({ socialTopics: socRes.topics });
                } else {
                    updateIdeaFlow({ socialTopics: FALLBACK_SOCIAL });
                }
            } catch {
                updateIdeaFlow({ socialTopics: FALLBACK_SOCIAL });
            } finally {
                setLoadSocial(false);
            }

            try {
                const pm = await loadPinkmilkTopicsInitial();
                updateIdeaFlow({
                    pinkmilkTopics: pm.pinkmilkTopics,
                    pinkmilkTopicPoolSource: pm.pinkmilkTopicPoolSource,
                });
            } finally {
                setLoadPm(false);
            }
        } finally {
            loadInProgress.current = false;
        }
    }, [updateIdeaFlow]);

    const nt = contentData.concept.ideaFlow?.newsTopics?.length ?? 0;
    const st = contentData.concept.ideaFlow?.socialTopics?.length ?? 0;
    const pt = contentData.concept.ideaFlow?.pinkmilkTopics?.length ?? 0;

    useEffect(() => {
        if (nt > 0 && st > 0 && pt > 0) return;
        loadInitial();
    }, [currentRecordId, nt, st, pt, loadInitial]);

    const regenNews = async () => {
        const selectedUrl = idea.picks?.newsUrl;
        const excludeUrls = idea.newsTopics.filter((x) => x.url !== selectedUrl).map((x) => x.url);
        setLoadNews(true);
        try {
            const res = await fetchNewsTopics({
                excludeUrls,
                excludeTitles: [],
                selectedUrl,
            });
            if (res?.ok && res.topics?.length) {
                updateIdeaFlow({ newsTopics: res.topics });
            }
        } catch {
            /* keep existing topics */
        } finally {
            setLoadNews(false);
        }
    };

    const regenSocial = async () => {
        const selectedUrl = idea.picks?.socialUrl;
        const excludeUrls = idea.socialTopics.filter((x) => x.url !== selectedUrl).map((x) => x.url);
        setLoadSocial(true);
        try {
            const res = await fetchSocialTopics({
                excludeUrls,
                excludeTitles: [],
                selectedUrl,
            });
            if (res?.ok && res.topics?.length) {
                updateIdeaFlow({ socialTopics: res.topics });
            }
        } catch {
            /* keep existing topics */
        } finally {
            setLoadSocial(false);
        }
    };

    const regenPinkmilk = async () => {
        setLoadPm(true);
        try {
            const next = await regeneratePinkmilkTopics(idea);
            updateIdeaFlow({
                pinkmilkTopics: next.pinkmilkTopics,
                pinkmilkTopicPoolSource: next.pinkmilkTopicPoolSource,
            });
        } finally {
            setLoadPm(false);
        }
    };

    const newsPick = idea.newsTopics?.find((x) => x.url === idea.picks?.newsUrl);
    const socialPick = idea.socialTopics?.find((x) => x.url === idea.picks?.socialUrl);
    const pmPick = idea.pinkmilkTopics?.find((x) => x.id === idea.picks?.pinkmilkId);

    const allPicked = !!(newsPick && socialPick && pmPick);
    const hasCards = (idea.conceptCards?.length ?? 0) > 0;

    const handleGenCards = async () => {
        if (!allPicked) return;
        setClaudeErr(null);
        setGenCards(true);
        try {
            const cards = await generateIdeaConceptCards(
                {
                    news: newsPick,
                    social: socialPick,
                    pinkmilk: pmPick,
                    pinkmilkExtra: idea.pinkmilkExtra || '',
                },
                language === 'nl' ? 'nl' : 'en'
            );
            const normalized = cards.map((c, i) => ({
                ...c,
                id: String(c.id ?? i + 1),
            }));
            updateIdeaFlow({
                conceptCards: normalized,
                selectedCardId: null,
                imagePrompts: null,
            });
            updateContent('visuals', { imagePrompts: null });
        } catch (e) {
            setClaudeErr(e.message || 'Claude error');
        } finally {
            setGenCards(false);
        }
    };

    const selectedCard = idea.conceptCards?.find((c) => String(c.id) === String(idea.selectedCardId));
    const selectedChannel = idea.selectedChannel || 'blog';

    const applyChannel = (id) => {
        const def = CHANNEL_DEFS.find((c) => c.id === id);
        const patch = {
            selectedChannel: id,
            facebookLinkedFromInsta: def?.insta === true || id === 'facebook_from_insta',
        };
        if (id !== 'blog') {
            patch.imagePrompts = null;
        }
        updateIdeaFlow(patch);
        if (id !== 'blog') {
            updateContent('visuals', { imagePrompts: null });
        }
    };

    const handleGenBlogImagePrompts = async () => {
        if (!selectedCard || selectedChannel !== 'blog') return;
        setClaudeErr(null);
        setGenBlogImg(true);
        try {
            const out = await generateImagePromptsForChannel(selectedCard, 'blog', language === 'nl' ? 'nl' : 'en');
            const next = { main: out.main_image_prompt, sub: out.sub_image_prompt };
            updateIdeaFlow({ imagePrompts: next });
            updateContent('visuals', { imagePrompts: next });
        } catch (e) {
            setClaudeErr(e.message || 'Claude error');
        } finally {
            setGenBlogImg(false);
        }
    };

    const canSyncPocketBase = !!(currentRecordId && !String(currentRecordId).startsWith('local-'));

    const imagePromptsForSync = contentData.visuals?.imagePrompts || idea.imagePrompts;

    const handleConfirm = async () => {
        if (!selectedCard) return;
        setPbSyncErr(null);
        setPbInfo(null);
        const res = await confirmStep1Blog(selectedCard, imagePromptsForSync);
        markStepComplete(1);
        if (res?.error) {
            setPbSyncErr(res.error.message || 'PocketBase sync mislukt.');
        } else if (res?.ok && !res.pushed) {
            setPbInfo(t('offlineNoPocketBase'));
        }
    };

    const handleSaveToPocketBase = async () => {
        if (!canSyncPocketBase) return;
        setPbSyncErr(null);
        setPbInfo(null);
        await forceSave();
    };

    return (
        <div className="concept-step">
            <div className="concept-step__pane concept-step__pane--sources">
                <div className="concept-step__upper-inner">
                    <div className="concept-step__cols">
                        <TopicColumn
                            icon={Newspaper}
                            radioGroup="idea-news"
                            title={t('colTrendingNews')}
                            topics={idea.newsTopics || []}
                            pickUrl={idea.picks?.newsUrl}
                            onPick={(topic) =>
                                updateIdeaFlow({ picks: { ...idea.picks, newsUrl: topic.url } })
                            }
                            onRegenerate={regenNews}
                            disabledRegen={false}
                            loading={loadNews}
                            t={t}
                        />
                        <TopicColumn
                            icon={TrendingUp}
                            radioGroup="idea-social"
                            title={t('colTrendingSocial')}
                            topics={idea.socialTopics || []}
                            pickUrl={idea.picks?.socialUrl}
                            onPick={(topic) =>
                                updateIdeaFlow({ picks: { ...idea.picks, socialUrl: topic.url } })
                            }
                            onRegenerate={regenSocial}
                            disabledRegen={false}
                            loading={loadSocial}
                            t={t}
                        />
                        <TopicColumn
                            icon={Heart}
                            radioGroup="idea-pinkmilk"
                            title={t('colPinkmilkShows')}
                            topics={idea.pinkmilkTopics || []}
                            pickId={idea.picks?.pinkmilkId}
                            onPick={(topic) =>
                                updateIdeaFlow({ picks: { ...idea.picks, pinkmilkId: topic.id } })
                            }
                            onRegenerate={regenPinkmilk}
                            disabledRegen={false}
                            loading={loadPm}
                            t={t}
                            belowList={
                                <div
                                    style={{
                                        padding: '6px 8px',
                                        borderTop: '1px solid var(--slate-200)',
                                        background: 'var(--white)',
                                    }}
                                >
                                    <label className="text-caption text-muted" htmlFor="pinkmilk-extra" style={{ display: 'block', marginBottom: 4 }}>
                                        {t('pinkmilkExtraLabel')}
                                    </label>
                                    <textarea
                                        id="pinkmilk-extra"
                                        className="textarea"
                                        rows={2}
                                        style={{ minHeight: 44, fontSize: 11, padding: '6px 8px', resize: 'none' }}
                                        placeholder={t('pinkmilkExtraPlaceholder')}
                                        value={idea.pinkmilkExtra ?? ''}
                                        onChange={(e) => updateIdeaFlow({ pinkmilkExtra: e.target.value })}
                                    />
                                </div>
                            }
                        />
                    </div>

                    {allPicked && (
                        <div className="concept-step__genbar">
                            <button type="button" className="btn btn-primary btn-sm" onClick={handleGenCards} disabled={genCards}>
                                {genCards ? <RefreshCw size={14} className="icon-spin" /> : <Wand2 size={14} />}
                                {t('generateAiCards')}
                            </button>
                        </div>
                    )}

                    {(claudeErr || pbSyncErr) && (
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
                            {claudeErr || pbSyncErr}
                        </div>
                    )}

                    {pbInfo && !claudeErr && !pbSyncErr && (
                        <div
                            className="text-caption text-muted"
                            style={{
                                padding: '8px 10px',
                                background: 'var(--slate-50)',
                                border: '1px solid var(--slate-200)',
                                borderRadius: '8px',
                            }}
                        >
                            {pbInfo}
                        </div>
                    )}
                </div>
            </div>

            <div className="concept-step__pane concept-step__pane--concepts">
                {hasCards ? (
                    <div className="concept-step__concepts-inner">
                        <div className="concept-step__channel-block">
                            <label className="label" style={{ marginBottom: 2 }}>
                                {t('channelTitle')}
                            </label>
                            <div className="concept-step__pills visual-step-channel-pills" role="group" aria-label={t('channelTitle')}>
                                {CHANNEL_DEFS.map((ch) => (
                                    <button
                                        key={ch.id}
                                        type="button"
                                        className={`btn btn-sm visual-step-channel-pills__btn${
                                            selectedChannel === ch.id ? ' btn-primary' : ' btn-secondary'
                                        }`}
                                        onClick={() => applyChannel(ch.id)}
                                    >
                                        {t(ch.labelKey)}
                                    </button>
                                ))}
                            </div>
                            {idea.facebookLinkedFromInsta && (
                                <p className="text-caption text-muted" style={{ margin: 0 }}>
                                    {t('step1FacebookLinkedHint')}
                                </p>
                            )}
                            {selectedChannel === 'blog' && selectedCard && (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        style={{ alignSelf: 'flex-start' }}
                                        onClick={handleGenBlogImagePrompts}
                                        disabled={genBlogImg}
                                    >
                                        {genBlogImg ? <RefreshCw size={14} className="icon-spin" /> : <Wand2 size={14} />}
                                        {t('genImagePrompts')}
                                    </button>
                                    <p className="text-caption text-muted" style={{ margin: 0 }}>
                                        {t('step1BlogImagePromptExplain')}
                                    </p>
                                </>
                            )}
                            {selectedChannel === 'blog' && idea.imagePrompts?.main && (
                                <div
                                    className="text-caption"
                                    style={{
                                        padding: '6px 8px',
                                        background: 'var(--slate-50)',
                                        borderRadius: '8px',
                                        maxHeight: '7rem',
                                        overflow: 'auto',
                                        lineHeight: 1.35,
                                    }}
                                >
                                    <strong>{t('imagePromptMain')}</strong>
                                    <div className="text-muted" style={{ whiteSpace: 'pre-wrap', marginBottom: 6 }}>
                                        {idea.imagePrompts.main}
                                    </div>
                                    <strong>{t('imagePromptSub')}</strong>
                                    <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                                        {idea.imagePrompts.sub}
                                    </div>
                                </div>
                            )}
                            {selectedChannel !== 'blog' && (
                                <p className="text-caption text-muted" style={{ margin: 0 }}>
                                    {t('step1ImagePromptsInVisuals')}
                                </p>
                            )}
                        </div>

                        <div className="concept-step__ai-wrap">
                            <div className="concept-step__ai-row">
                                {idea.conceptCards.map((c) => {
                                    const sel = String(idea.selectedCardId) === String(c.id);
                                    return (
                                        <button
                                            type="button"
                                            key={c.id}
                                            className={`concept-ai-card${sel ? ' selected' : ''}`}
                                            onClick={() => {
                                                updateIdeaFlow({
                                                    selectedCardId: String(c.id),
                                                    imagePrompts: null,
                                                });
                                                updateContent('visuals', { imagePrompts: null });
                                            }}
                                        >
                                            <div className="concept-ai-card__intro">{c.intro_heading}</div>
                                            <div className="concept-ai-card__heading">{c.heading}</div>
                                            <div className="concept-ai-card__sub">{c.sub_heading}</div>
                                            <div className="concept-ai-card__body">{c.body || ''}</div>
                                            {sel && (
                                                <div style={{ marginTop: 'auto', paddingTop: 4, color: 'var(--primary)' }}>
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="concept-step__toolbar">
                                <p className="text-caption text-muted" style={{ margin: 0, flex: '1 1 160px' }}>
                                    {t('step1ConfirmHint')}
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    disabled={!canSyncPocketBase || isSaving}
                                    onClick={handleSaveToPocketBase}
                                    title={t('saveToPocketBaseHint')}
                                >
                                    {isSaving ? <RefreshCw size={12} className="icon-spin" /> : <UploadCloud size={12} />}
                                    {t('saveToPocketBase')}
                                </button>
                                <button type="button" className="btn btn-primary btn-sm" disabled={!selectedCard} onClick={handleConfirm}>
                                    {t('confirmStep1')}
                                </button>
                            </div>
                            <p className="text-caption text-muted" style={{ margin: '0 0 4px' }}>
                                {t('saveToPocketBaseHint')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="concept-step__lower-empty">
                        <p className="text-caption text-muted" style={{ margin: 0, textAlign: 'center', maxWidth: 480 }}>
                            {t('conceptHalfPlaceholder')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
