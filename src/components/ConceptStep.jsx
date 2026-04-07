import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    RefreshCw,
    Check,
    Wand2,
    Newspaper,
    TrendingUp,
    Heart,
    UploadCloud,
} from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import {
    generateIdeaConceptCards,
    generateImagePromptsForChannel,
} from '../services/claude';
import { fetchNewsTopics, fetchSocialTopics } from '../services/topicSources';
import { pickRandomPinkMilkShows } from '../services/pinkmilkShows';

const CHANNEL_DEFS = [
    { id: 'blog', labelKey: 'chBlog', insta: false },
    { id: 'insta_post', labelKey: 'chInstaPost', insta: true },
    { id: 'reel', labelKey: 'chReel', insta: true },
    { id: 'carousel', labelKey: 'chCarousel', insta: true },
    { id: 'facebook_from_insta', labelKey: 'chFacebookFromInsta', insta: false },
    { id: 'youtube_long', labelKey: 'chYoutubeLong', insta: false },
    { id: 'youtube_short', labelKey: 'chYoutubeShort', insta: false },
    { id: 'tiktok', labelKey: 'chTiktok', insta: false },
    { id: 'linkedin', labelKey: 'chLinkedin', insta: false },
    { id: 'bluesky', labelKey: 'chBluesky', insta: false },
];

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

function TopicColumn({
    icon: Icon,
    title,
    radioGroup,
    topics,
    pickUrl,
    pickId,
    onPick,
    onRegenerate,
    disabledRegen,
    loading,
    t,
    belowList = null,
}) {
    return (
        <div className="concept-topic-col">
            <div className="concept-topic-col__head">
                <div className="concept-topic-col__head-main">
                    {Icon && <Icon size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                    <span className="concept-topic-col__title">{title}</span>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm concept-topic-col__refresh"
                    onClick={onRegenerate}
                    disabled={loading || disabledRegen}
                    title={t('regenerateTopics')}
                >
                    <RefreshCw size={12} className={loading ? 'icon-spin' : ''} />
                    <span>{t('regenerateTopicsCompact')}</span>
                </button>
            </div>
            <div className="concept-topic-col__list">
                {loading
                    ? [1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="skeleton" style={{ height: 36, marginBottom: 3 }} />
                      ))
                    : topics.map((topic) => {
                          const sel = pickUrl ? topic.url === pickUrl : topic.id === pickId;
                          return (
                              <label
                                  key={topic.id + String(topic.url)}
                                  className={`concept-topic-option${sel ? ' concept-topic-option--selected' : ''}`}
                              >
                                  <input
                                      type="radio"
                                      name={radioGroup}
                                      checked={sel}
                                      onChange={() => onPick(topic)}
                                  />
                                  <div className="concept-topic-option__body">
                                      <div className="concept-topic-option__src">{topic.source}</div>
                                      <div className="concept-topic-option__title">{topic.title}</div>
                                  </div>
                              </label>
                          );
                      })}
            </div>
            {belowList}
        </div>
    );
}

export default function ConceptStep() {
    const {
        contentData,
        updateIdeaFlow,
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
    const [genImg, setGenImg] = useState(false);
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
                updateIdeaFlow({
                    pinkmilkTopics: pickRandomPinkMilkShows({ count: 5 }),
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

    const regenPinkmilk = () => {
        const selectedId = idea.picks?.pinkmilkId;
        const excludeIds = idea.pinkmilkTopics.filter((x) => x.id !== selectedId).map((x) => x.id);
        updateIdeaFlow({
            pinkmilkTopics: pickRandomPinkMilkShows({ selectedId, excludeIds, count: 5 }),
        });
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
        } catch (e) {
            setClaudeErr(e.message || 'Claude error');
        } finally {
            setGenCards(false);
        }
    };

    const selectedCard = idea.conceptCards?.find((c) => String(c.id) === String(idea.selectedCardId));

    const setChannel = (id) => {
        const def = CHANNEL_DEFS.find((c) => c.id === id);
        const fbLinked =
            (def?.insta && ['insta_post', 'reel', 'carousel'].includes(id)) ||
            id === 'facebook_from_insta';
        updateIdeaFlow({
            selectedChannel: id,
            facebookLinkedFromInsta: !!fbLinked,
        });
    };

    const handleGenImages = async () => {
        if (!selectedCard) return;
        setClaudeErr(null);
        setGenImg(true);
        try {
            const prompts = await generateImagePromptsForChannel(
                selectedCard,
                idea.selectedChannel || 'blog',
                language === 'nl' ? 'nl' : 'en'
            );
            updateIdeaFlow({
                imagePrompts: prompts,
            });
        } catch (e) {
            setClaudeErr(e.message || 'Claude error');
        } finally {
            setGenImg(false);
        }
    };

    const canSyncPocketBase = !!(currentRecordId && !String(currentRecordId).startsWith('local-'));

    const handleConfirm = async () => {
        if (!selectedCard) return;
        if ((idea.selectedChannel || 'blog') !== 'blog') {
            return;
        }
        setPbSyncErr(null);
        setPbInfo(null);
        const res = await confirmStep1Blog(selectedCard, idea.imagePrompts);
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
            <div className="concept-step__upper">
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

            <div className="concept-step__lower">
            {hasCards ? (
                <div className="concept-step__ai-wrap">
                    <div className="concept-step__ai-row">
                        {idea.conceptCards.map((c) => {
                            const sel = String(idea.selectedCardId) === String(c.id);
                            return (
                                <button
                                    type="button"
                                    key={c.id}
                                    className={`concept-ai-card${sel ? ' selected' : ''}`}
                                    onClick={() =>
                                        updateIdeaFlow({
                                            selectedCardId: String(c.id),
                                            imagePrompts: null,
                                        })
                                    }
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
                        <span className="label">{t('channelTitle')}</span>
                        <div className="concept-step__pills">
                            {CHANNEL_DEFS.map((ch) => (
                                <button
                                    key={ch.id}
                                    type="button"
                                    className={`platform-pill ${idea.selectedChannel === ch.id ? 'active' : ''}`}
                                    onClick={() => setChannel(ch.id)}
                                >
                                    {t(ch.labelKey)}
                                </button>
                            ))}
                        </div>
                        {selectedCard && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleGenImages} disabled={genImg}>
                                    {genImg ? <RefreshCw size={12} className="icon-spin" /> : <Wand2 size={12} />}
                                    {t('genImagePrompts')}
                                </button>
                                <p className="text-caption text-muted" style={{ margin: 0, maxWidth: 420 }}>
                                    {t('imagePromptClaudeNote')}
                                </p>
                            </div>
                        )}
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
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={!selectedCard || (idea.selectedChannel || 'blog') !== 'blog' || !idea.imagePrompts}
                            onClick={handleConfirm}
                        >
                            {t('confirmStep1')}
                        </button>
                    </div>
                    <p className="text-caption text-muted" style={{ margin: '0 0 4px' }}>
                        {t('saveToPocketBaseHint')}
                    </p>
                    {idea.imagePrompts && (
                        <div className="concept-step__prompts">
                            <strong>{t('imagePromptMain')}</strong> {idea.imagePrompts.main}
                            <br />
                            <strong>{t('imagePromptSub')}</strong> {idea.imagePrompts.sub}
                        </div>
                    )}
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
