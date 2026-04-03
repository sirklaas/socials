import React from 'react';
import {
    Lightbulb,
    Type,
    Image as ImageIcon,
    Video,
    Frame,
    FileText,
    CheckCircle,
    Calendar,
    ChevronRight,
    Check,
    ArrowRight,
    Bell,
    User,
    Save,
    Send,
    Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalProvider, useGlobalContext } from './context/GlobalContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import StepRenderer from './StepRenderer';

const STEPS = [
    { id: 1, name: 'step1', subtitle: 'step1Sub', icon: Lightbulb },
    { id: 2, name: 'step2', subtitle: 'step2Sub', icon: Type },
    { id: 3, name: 'step3', subtitle: 'step3Sub', icon: ImageIcon },
    { id: 4, name: 'step4', subtitle: 'step4Sub', icon: Video },
    { id: 5, name: 'step5', subtitle: 'step5Sub', icon: Frame },
    { id: 6, name: 'step6', subtitle: 'step6Sub', icon: FileText },
    { id: 7, name: 'step7', subtitle: 'step7Sub', icon: CheckCircle },
    { id: 8, name: 'step8', subtitle: 'step8Sub', icon: Calendar }
];

function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="btn btn-secondary btn-sm"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: '80px'
            }}
        >
            <Languages size={16} />
            {language.toUpperCase()}
        </button>
    );
}

function Dashboard() {
    const {
        currentStep,
        setCurrentStep,
        completedSteps,
        markStepComplete,
        isSaving,
        lastSaved,
        createNewCampaign,
        currentRecordId,
        campaigns,
        loadCampaign,
        isLoading
    } = useGlobalContext();
    const { language, t } = useLanguage();

    if (isLoading && campaigns.length === 0) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--slate-50)',
                padding: '40px',
                textAlign: 'center'
            }}>
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
                <p style={{ color: 'var(--slate-900)', fontFamily: 'var(--font-heading)', fontSize: '20px', marginBottom: '8px' }}>
                    {t('processing')}
                </p>
                <p style={{ color: 'var(--slate-500)', maxWidth: '400px', fontSize: '14px', marginBottom: '24px' }}>
                    Connecting to Pink Milk Database... If this takes too long, please check your internet or the PocketBase URL.
                </p>
                <button className="btn btn-secondary" onClick={() => createNewCampaign('Local Campaign')}>
                    {t('newCampaign')}
                </button>
            </div>
        );
    }

    const nextStep = () => {
        if (currentStep < 8) {
            markStepComplete(currentStep);
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const formatLastSaved = () => {
        if (!lastSaved) return t('notSaved');
        const diff = Math.floor((new Date() - lastSaved) / 1000);
        if (diff < 60) return t('justSaved');
        if (diff < 3600) return `${Math.floor(diff / 60)} ${t('minutesAgo')}`;
        return lastSaved.toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="app-layout">
            {/* Top Navigation */}
            <header className="top-nav">
                <div className="flex items-center gap-lg">
                    <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.05em' }}>
                        Pink Milk <span style={{ color: 'var(--primary)' }}>Social Engine</span>
                    </h1>
                </div>

                <div style={{ marginLeft: 'auto' }} className="flex items-center gap-lg">
                    {Array.isArray(campaigns) && campaigns.length > 0 && (
                        <select
                            className="select"
                            style={{ width: 'auto', height: '36px', padding: '0 12px', fontSize: '14px', border: '1px solid var(--slate-200)', borderRadius: '6px' }}
                            value={currentRecordId || ''}
                            onChange={(e) => loadCampaign(e.target.value)}
                        >
                            <option value="">{t('select')}...</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.name || 'Untitled'}</option>
                            ))}
                        </select>
                    )}
                    <div className="flex items-center gap-md">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: currentRecordId?.startsWith('local-') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                            color: currentRecordId?.startsWith('local-') ? 'var(--warning)' : 'var(--success)',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'currentColor'
                            }} />
                            {currentRecordId?.startsWith('local-') ? 'Offline Mode' : 'Live Sync'}
                        </div>
                        <span className="text-small text-muted">
                            {isSaving ? t('savingStatus') : formatLastSaved()}
                        </span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => createNewCampaign()}>
                        {t('newCampaign')}
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <Send size={16} /> {t('publishNow')}
                    </button>
                    <div style={{ width: '1px', height: '32px', background: 'var(--slate-200)', margin: '0 8px' }} />
                    <LanguageToggle />
                    <button style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary-ultralight)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <User size={20} style={{ color: 'var(--primary)' }} />
                    </button>
                </div>
            </header>

            <div className="app-body">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <p style={{ fontSize: '12px', color: 'var(--slate-500)', marginBottom: '4px' }}>{t('workflow')}</p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--slate-950)' }}>{t('contentCampaign')}</p>
                    </div>

                    <nav className="sidebar-nav">
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = completedSteps.includes(step.id);

                            let buttonClass = 'step-btn';
                            if (isActive) buttonClass += ' active';
                            else if (isCompleted) buttonClass += ' completed';

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(step.id)}
                                    className={buttonClass}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: isActive ? 'rgba(255,255,255,0.2)' : isCompleted ? 'var(--primary-light)' : 'var(--slate-100)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {isCompleted && !isActive ? (
                                            <Check size={16} style={{ color: 'var(--white)' }} />
                                        ) : (
                                            <Icon size={16} style={{ color: isActive ? 'var(--white)' : 'var(--slate-500)' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>{t('stepWord')} {step.id}: {t(step.name)}</span>
                                        </div>
                                        <p style={{
                                            fontSize: '12px',
                                            opacity: 0.7,
                                            marginTop: '2px',
                                            fontFamily: 'var(--font-body)'
                                        }}>
                                            {t(step.subtitle)}
                                        </p>
                                    </div>
                                    {isActive && <ArrowRight size={16} />}
                                </button>
                            );
                        })}
                    </nav>

                    <div style={{
                        marginTop: 'auto',
                        paddingTop: 'var(--space-lg)',
                        borderTop: '1px solid var(--slate-100)'
                    }}>
                        <p style={{ fontSize: '12px', color: 'var(--slate-500)', marginBottom: '8px' }}>{t('quickActions')}</p>
                        <div className="flex flex-col gap-sm">
                            <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                                {t('templates')}
                            </button>
                            <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                                {t('assetLibrary')}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ height: '100%' }}
                        >
                            <StepRenderer />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <LanguageProvider>
            <GlobalProvider>
                <Dashboard />
            </GlobalProvider>
        </LanguageProvider>
    );
}
