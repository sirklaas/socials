import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Lightbulb,
    Sparkles,
    RefreshCw,
    Check,
    Wand2,
    Newspaper,
    TrendingUp,
    Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobalContext } from '../context/GlobalContext';
import { useLanguage } from '../context/LanguageContext';
import {
    generateIdeaConceptCards,
    generateImagePromptsForChannel,
} from '../services/claude';
import { fetchNewsTopics, fetchSocialTopics, fetchPinkmilkRaw } from '../services/topicSources';
import { extractPinkMilkCandidates, pickPinkMilkTopics } from '../services/pinkmilkTopics';

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
    { id: 'fn-1', source: 'Demo', title: 'Nederland zet in op klimaat en energie', summary: 'Het kabinet presenteert plannen voor duurzame energie en verduurzaming van de gebouwde omgeving.\nMeer aandacht voor zon, wind en isolatie.\nBedrijven krijgen fiscale prikkels om sneller te vergroenen.', url: '#' },
    { id: 'fn-2', source: 'Demo', title: 'Tech-sector groeit ondanks economische tweestrijd', summary: 'Scale-ups in AI en productiviteitstools blijven investeringen aantrekken.\nWerknemers zoeken scholing in digitale vaardigheden.\nHybride werken blijft de norm in kennissectoren.', url: '#' },
    { id: 'fn-3', source: 'Demo', title: 'Onderwijs experimenteert met gepersonaliseerd leren', summary: 'Scholen piloten met software die leerlingtempo meet.\nDocenten krijgen meer tijd voor coaching.\nKritici vragen aandacht voor privacy en toetsing.', url: '#' },
    { id: 'fn-4', source: 'Demo', title: 'Sport en welzijn: beweging op recept wint aan populariteit', summary: 'Huisartsen en fysiotherapeuten verwijzen vaker naar lokale sportprogramma’s.\nHet doel is langdurige gezondheidswinst.\nGemeenten investeren in buitensport.', url: '#' },
    { id: 'fn-5', source: 'Demo', title: 'Cultureel erfgoed digitaliseert voor jong publiek', summary: 'Musea en archieven zetten AI-gestuurde tours en online archieven in.\nBezoekersaantallen bij online evenementen stijgen.\nEr blijft discussie over auteursrecht op scans.', url: '#' },
];

const FALLBACK_SOCIAL = [
    { id: 'fs-1', source: 'Demo', title: 'Zoektrend: elektrische fiets leasing', summary: 'Veel zoekvolume rond leaseconstructies en subsidies.\nTrending in heel Nederland.\nRelevant voor mobiliteit en duurzaamheid.', url: '#' },
    { id: 'fs-2', source: 'Demo', title: 'Zoektrend: AI voor kleine ondernemers', summary: 'Stijgende interesse in betaalbare AI-tools.\nContent rond tutorials en workflows.\nGericht op zzp en MKB.', url: '#' },
    { id: 'fs-3', source: 'Demo', title: 'Zoektrend: gezonde meal prep', summary: 'Korte video’s over voorbereiden van maaltijden gaan viel.\nFocus op tijdsbesparing en voeding.\nPast bij lifestyle en welzijn.', url: '#' },
    { id: 'fs-4', source: 'Demo', title: 'Zoektrend: kamperen met kids', summary: 'Seizoenspieken in zoekgedrag naar routes en gear.\nFamiliecontent en reviews populair.\nKans voor travel en outdoor merken.', url: '#' },
    { id: 'fs-5', source: 'Demo', title: 'Zoektrend: studiekeuze 2026', summary: 'Jongeren oriënteren zich op HBO en WO.\nOpen dagen en alternatieve leerroutes in beeld.\nOnderwijsmarketing piekt.', url: '#' },
];

function TopicRow({ icon: Icon, title, radioGroup, topics, pickUrl, pickId, onPick, onRegenerate, disabledRegen, loading, t }) {
    return (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h4
                className="font-heading"
                style={{
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--slate-950)',
                }}
            >
                {Icon && <Icon size={18} style={{ color: 'var(--primary)' }} />}
                {title}
            </h4>
            <p className="text-caption text-muted" style={{ marginBottom: 'var(--space-sm)' }}>
                {t('topicPickHint')}
            </p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 'var(--space-md)',
                }}
            >
                {loading
                    ? [1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="card" style={{ minHeight: '120px', opacity: 0.5 }} />
                      ))
                    : topics.map((topic) => {
                          const sel = pickUrl ? topic.url === pickUrl : topic.id === pickId;
                          return (
                              <label
                                  key={topic.id + topic.url}
                                  className={`card ${sel ? 'selected' : ''}`}
                                  style={{
                                      cursor: 'pointer',
                                      padding: 'var(--space-md)',
                                      display: 'flex',
                                      gap: '10px',
                                      alignItems: 'flex-start',
                                      border: sel ? '2px solid var(--primary)' : undefined,
                                  }}
                              >
                                  <input
                                      type="radio"
                                      name={radioGroup}
                                      checked={sel}
                                      onChange={() => onPick(topic)}
                                      style={{ marginTop: '4px' }}
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                      <p className="text-caption text-muted" style={{ marginBottom: '4px' }}>
                                          {topic.source}
                                      </p>
                                      <p className="text-small font-medium" style={{ marginBottom: '6px', lineHeight: 1.35 }}>
                                          {topic.title}
                                      </p>
                                      <p className="text-caption text-muted" style={{ lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                                          {topic.summary}
                                      </p>
                                  </div>
                              </label>
                          );
                      })}
            </div>
            <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 'var(--space-md)' }}
                onClick={onRegenerate}
                disabled={loading || disabledRegen}
            >
                <RefreshCw size={14} className={loading ? 'spinner' : ''} />
                {t('regenerateTopics')}
            </button>
        </div>
    );
}

export default function ConceptStep() {
    const { contentData, updateIdeaFlow, confirmStep1Blog, currentRecordId } = useGlobalContext();
    const { language, t } = useLanguage();
    const idea = contentData.concept.ideaFlow || {};

    const [loadNews, setLoadNews] = useState(false);
    const [loadSocial, setLoadSocial] = useState(false);
    const [loadPm, setLoadPm] = useState(false);
    const [errNews, setErrNews] = useState(null);
    const [errSocial, setErrSocial] = useState(null);
    const [errPm, setErrPm] = useState(null);

    const [genCards, setGenCards] = useState(false);
    const [genImg, setGenImg] = useState(false);
    const [claudeErr, setClaudeErr] = useState(null);
    const loadInProgress = useRef(false);

    const loadInitial = useCallback(async () => {
        if (loadInProgress.current) return;
        loadInProgress.current = true;
        try {
            setErrNews(null);
            setErrSocial(null);
            setErrPm(null);
            setLoadNews(true);
            setLoadSocial(true);
            setLoadPm(true);

            try {
                const newsRes = await fetchNewsTopics({}).catch(() => null);
                if (newsRes?.ok && newsRes.topics?.length) {
                    updateIdeaFlow({ newsTopics: newsRes.topics });
                } else {
                    updateIdeaFlow({ newsTopics: FALLBACK_NEWS });
                    setErrNews('fallback');
                }
            } catch {
                updateIdeaFlow({ newsTopics: FALLBACK_NEWS });
                setErrNews('fallback');
            } finally {
                setLoadNews(false);
            }

            try {
                const socRes = await fetchSocialTopics({}).catch(() => null);
                if (socRes?.ok && socRes.topics?.length) {
                    updateIdeaFlow({ socialTopics: socRes.topics });
                } else {
                    updateIdeaFlow({ socialTopics: FALLBACK_SOCIAL });
                    setErrSocial('fallback');
                }
            } catch {
                updateIdeaFlow({ socialTopics: FALLBACK_SOCIAL });
                setErrSocial('fallback');
            } finally {
                setLoadSocial(false);
            }

            try {
                const raw = await fetchPinkmilkRaw();
                const candidates =
                    raw?.ok && raw.data && typeof raw.data === 'object'
                        ? extractPinkMilkCandidates(raw.data)
                        : extractPinkMilkCandidates({});
                const five = pickPinkMilkTopics(candidates, { count: 5 });
                updateIdeaFlow({
                    pinkmilkCandidates: candidates,
                    pinkmilkTopics: five,
                });
                if (!raw?.ok || !raw.data) {
                    setErrPm('fallback');
                }
            } catch {
                const candidates = extractPinkMilkCandidates({});
                updateIdeaFlow({
                    pinkmilkCandidates: candidates,
                    pinkmilkTopics: pickPinkMilkTopics(candidates, { count: 5 }),
                });
                setErrPm('fallback');
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
        setErrNews(null);
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
            setErrNews('err');
        } finally {
            setLoadNews(false);
        }
    };

    const regenSocial = async () => {
        const selectedUrl = idea.picks?.socialUrl;
        const excludeUrls = idea.socialTopics.filter((x) => x.url !== selectedUrl).map((x) => x.url);
        setLoadSocial(true);
        setErrSocial(null);
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
            setErrSocial('err');
        } finally {
            setLoadSocial(false);
        }
    };

    const regenPinkmilk = () => {
        const selectedId = idea.picks?.pinkmilkId;
        const excludeIds = idea.pinkmilkTopics.filter((x) => x.id !== selectedId).map((x) => x.id);
        const candidates =
            idea.pinkmilkCandidates?.length > 0
                ? idea.pinkmilkCandidates
                : extractPinkMilkCandidates({});
        const next = pickPinkMilkTopics(candidates, { selectedId, excludeIds, count: 5 });
        updateIdeaFlow({ pinkmilkTopics: next });
    };

    const newsPick = idea.newsTopics?.find((x) => x.url === idea.picks?.newsUrl);
    const socialPick = idea.socialTopics?.find((x) => x.url === idea.picks?.socialUrl);
    const pmPick = idea.pinkmilkTopics?.find((x) => x.id === idea.picks?.pinkmilkId);

    const allPicked = !!(newsPick && socialPick && pmPick);

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

    const handleConfirm = () => {
        if (!selectedCard) return;
        if ((idea.selectedChannel || 'blog') !== 'blog') {
            return;
        }
        confirmStep1Blog(selectedCard, idea.imagePrompts);
    };

    return (
        <div className="container-grid cols-1-2" style={{ height: '100%', alignItems: 'stretch' }}>
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Lightbulb size={20} style={{ color: 'var(--accent-amber)' }} />
                        {t('step1InspirationTitle')}
                    </h3>
                </div>
                <div className="container-body">
                    <p className="text-small text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                        {t('step1TopicFeedIntro')}
                    </p>
                    {(errNews || errSocial || errPm) && (
                        <p className="text-caption text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                            {t('loadTopicsError')}
                        </p>
                    )}
                    <TopicRow
                        icon={Newspaper}
                        radioGroup="idea-news"
                        title={t('sourceNews')}
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
                    <TopicRow
                        icon={TrendingUp}
                        radioGroup="idea-social"
                        title={t('sourceSocial')}
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
                    <TopicRow
                        icon={Heart}
                        radioGroup="idea-pinkmilk"
                        title={t('sourcePinkmilk')}
                        topics={idea.pinkmilkTopics || []}
                        pickId={idea.picks?.pinkmilkId}
                        onPick={(topic) =>
                            updateIdeaFlow({ picks: { ...idea.picks, pinkmilkId: topic.id } })
                        }
                        onRegenerate={regenPinkmilk}
                        disabledRegen={false}
                        loading={loadPm}
                        t={t}
                    />
                    {allPicked && (
                        <div style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--slate-100)' }}>
                            <p className="text-small text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                                {t('picksCompleteHint')}
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleGenCards}
                                disabled={genCards}
                            >
                                {genCards ? (
                                    <RefreshCw size={18} className="spinner" />
                                ) : (
                                    <Wand2 size={18} />
                                )}
                                {t('generateAiCards')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Sparkles size={20} style={{ color: 'var(--accent-purple)' }} />
                        {t('aiConceptCards')}
                    </h3>
                    {idea.conceptCards?.length > 0 && (
                        <span className="badge badge-ai">{t('aiGenerated')}</span>
                    )}
                </div>
                <div className="container-body">
                    {claudeErr && (
                        <div
                            style={{
                                padding: 'var(--space-md)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--error)',
                                borderRadius: '8px',
                                color: 'var(--error)',
                                marginBottom: 'var(--space-md)',
                                fontSize: '14px',
                            }}
                        >
                            {claudeErr}
                        </div>
                    )}

                    <p className="text-caption text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                        {t('pickOneCard')}
                    </p>

                    {idea.conceptCards?.length > 0 ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: 'var(--space-md)',
                            }}
                        >
                            {idea.conceptCards.map((c) => {
                                const sel = String(idea.selectedCardId) === String(c.id);
                                return (
                                    <motion.div
                                        key={c.id}
                                        layout
                                        className={`card ${sel ? 'selected' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            padding: 'var(--space-md)',
                                            border: sel ? '2px solid var(--primary)' : undefined,
                                        }}
                                        onClick={() =>
                                            updateIdeaFlow({
                                                selectedCardId: String(c.id),
                                                imagePrompts: null,
                                            })
                                        }
                                    >
                                        <p className="text-caption" style={{ color: 'var(--accent-purple)' }}>
                                            {c.intro_heading}
                                        </p>
                                        <h5 className="text-small font-medium" style={{ margin: '8px 0' }}>
                                            {c.heading}
                                        </h5>
                                        <p className="text-caption text-muted" style={{ marginBottom: '8px' }}>
                                            {c.sub_heading}
                                        </p>
                                        <p className="text-caption" style={{ lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                                            {(c.body || '').slice(0, 320)}
                                            {(c.body || '').length > 320 ? '…' : ''}
                                        </p>
                                        {sel && (
                                            <div style={{ marginTop: '8px', color: 'var(--primary)' }}>
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-muted text-small" style={{ padding: 'var(--space-xl)' }}>
                            {t('noConceptsDesc')}
                        </div>
                    )}

                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        <label className="label">{t('channelTitle')}</label>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
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
                        {idea.facebookLinkedFromInsta && (
                            <p className="text-caption text-muted">{t('facebookLinkedNote')}</p>
                        )}
                    </div>

                    {selectedCard && (
                        <div style={{ marginTop: 'var(--space-lg)' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleGenImages}
                                disabled={genImg}
                            >
                                {genImg ? <RefreshCw size={16} className="spinner" /> : <Wand2 size={16} />}
                                {t('genImagePrompts')}
                            </button>
                        </div>
                    )}

                    {idea.imagePrompts && (
                        <div
                            style={{
                                marginTop: 'var(--space-lg)',
                                padding: 'var(--space-md)',
                                background: 'var(--slate-50)',
                                borderRadius: '8px',
                            }}
                        >
                            <p className="label" style={{ marginBottom: '8px' }}>
                                {t('imagePromptsTitle')}
                            </p>
                            <p className="text-caption text-muted">{t('imagePromptMain')}</p>
                            <p className="text-small" style={{ marginBottom: 'var(--space-md)', whiteSpace: 'pre-wrap' }}>
                                {idea.imagePrompts.main}
                            </p>
                            <p className="text-caption text-muted">{t('imagePromptSub')}</p>
                            <p className="text-small" style={{ whiteSpace: 'pre-wrap' }}>
                                {idea.imagePrompts.sub}
                            </p>
                        </div>
                    )}
                </div>
                <div className="container-footer">
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={!selectedCard || (idea.selectedChannel || 'blog') !== 'blog' || !idea.imagePrompts}
                        onClick={handleConfirm}
                        style={{
                            opacity:
                                !selectedCard || (idea.selectedChannel || 'blog') !== 'blog' || !idea.imagePrompts
                                    ? 0.5
                                    : 1,
                        }}
                    >
                        {t('confirmStep1')}
                    </button>
                </div>
            </div>
        </div>
    );
}
