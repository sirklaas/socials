import React, { useState } from 'react';
import { Calendar, Clock, Globe, Send, Check, ChevronLeft, ChevronRight, Youtube, Instagram, Linkedin, Smartphone, AlertCircle, Zap } from 'lucide-react';
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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const OPTIMAL_TIMES = [
    { platform: 'YouTube', time: '14:00', day: 'Wed' },
    { platform: 'Instagram', time: '18:00', day: 'Thu' },
    { platform: 'TikTok', time: '19:00', day: 'Fri' },
    { platform: 'LinkedIn', time: '09:00', day: 'Tue' },
];

export default function PublishStep() {
    const { contentData } = useGlobalContext();
    const { language, t } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('14:00');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    const DAYS = language === 'nl'
        ? ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handlePublish = () => {
        setIsPublishing(true);
        setTimeout(() => {
            setIsPublishing(false);
            setIsPublished(true);
        }, 2000);
    };

    // Generate calendar days for current month
    const getDaysInMonth = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Adjust for Monday start
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const monthName = selectedDate.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="container-grid cols-2" style={{ height: '100%' }}>
            {/* Left Container: Calendar (60%) */}
            <div className="content-container" style={{ flex: 1.2 }}>
                <div className="container-header">
                    <h3 className="container-title">
                        <Calendar size={20} style={{ color: 'var(--primary)' }} />
                        {t('scheduleCalendar')}
                    </h3>
                    <div className="flex gap-sm items-center">
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-small font-medium" style={{ minWidth: '140px', textAlign: 'center' }}>
                            {monthName}
                        </span>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="container-body">
                    {/* Calendar Grid */}
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        {/* Day Headers */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '4px',
                            marginBottom: '8px'
                        }}>
                            {DAYS.map(day => (
                                <div key={day} style={{
                                    textAlign: 'center',
                                    padding: '8px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: 'var(--slate-500)'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '4px'
                        }}>
                            {getDaysInMonth().map((day, i) => {
                                const isToday = day === new Date().getDate() &&
                                    selectedDate.getMonth() === new Date().getMonth();
                                const isSelected = day === selectedDate.getDate();
                                const hasEvent = day && [5, 12, 18, 25].includes(day);

                                return (
                                    <div
                                        key={i}
                                        onClick={() => day && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                        style={{
                                            aspectRatio: '1',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '8px',
                                            cursor: day ? 'pointer' : 'default',
                                            background: isSelected ? 'var(--primary)' : isToday ? 'var(--primary-ultralight)' : 'transparent',
                                            color: isSelected ? 'white' : isToday ? 'var(--primary)' : 'var(--slate-700)',
                                            border: isToday && !isSelected ? '2px solid var(--primary-light)' : '2px solid transparent',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <span style={{ fontSize: '14px', fontWeight: isToday || isSelected ? 500 : 400 }}>
                                            {day}
                                        </span>
                                        {hasEvent && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                display: 'flex',
                                                gap: '2px'
                                            }}>
                                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-coral)' }} />
                                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-purple)' }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Suggested Times */}
                    <div>
                        <label className="label">
                            <Zap size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--accent-amber)' }} />
                            {t('aiSuggestedTimes')}
                        </label>
                        <div className="flex flex-col gap-sm">
                            {OPTIMAL_TIMES.map((opt, i) => (
                                <div
                                    key={i}
                                    className="card"
                                    style={{
                                        padding: 'var(--space-md)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedTime(opt.time)}
                                >
                                    <div className="flex items-center gap-sm">
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-amber)',
                                            animation: 'pulse 2s infinite'
                                        }} />
                                        <span className="text-small">{opt.platform}</span>
                                    </div>
                                    <div className="flex items-center gap-md">
                                        <span className="text-caption text-muted">{language === 'nl' ? t(opt.day.toLowerCase()) : opt.day}</span>
                                        <span className="badge badge-completed">{opt.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Container: Publishing Settings (40%) */}
            <div className="content-container">
                <div className="container-header">
                    <h3 className="container-title">
                        <Send size={20} style={{ color: 'var(--accent-purple)' }} />
                        {t('publishSettings')}
                    </h3>
                </div>

                <div className="container-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Selected Date/Time */}
                    <div style={{
                        padding: 'var(--space-xl)',
                        background: 'var(--slate-50)',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <p className="text-caption text-muted" style={{ marginBottom: '8px' }}>{language === 'nl' ? 'Ingepland voor' : 'Scheduled For'}</p>
                        <p className="font-heading" style={{ fontSize: '28px', color: 'var(--slate-950)' }}>
                            {selectedDate.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex items-center justify-center gap-sm" style={{ marginTop: '12px' }}>
                            <Clock size={16} style={{ color: 'var(--primary)' }} />
                            <select
                                className="select"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                style={{ width: 'auto', padding: '8px 16px' }}
                            >
                                {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Platform Toggles */}
                    <div>
                        <label className="label">{t('platforms')}</label>
                        <div className="flex flex-col gap-sm">
                            {PLATFORMS.map(p => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between"
                                    style={{
                                        padding: 'var(--space-md)',
                                        background: 'white',
                                        border: '1px solid var(--slate-200)',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <div className="flex items-center gap-sm">
                                        <p.icon size={18} style={{ color: p.color }} />
                                        <span className="text-small font-medium">{p.name}</span>
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
                            ))}
                        </div>
                    </div>

                    {/* Timezone */}
                    <div>
                        <label className="label">
                            <Globe size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {t('timezone')}
                        </label>
                        <select className="select">
                            <option>Europe/Amsterdam (CET)</option>
                            <option>America/New_York (EST)</option>
                            <option>America/Los_Angeles (PST)</option>
                            <option>Europe/London (GMT)</option>
                        </select>
                    </div>
                </div>

                <div className="container-footer" style={{ flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {isPublished ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                width: '100%',
                                padding: 'var(--space-lg)',
                                background: 'var(--primary-ultralight)',
                                border: '1px solid var(--primary-light)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}
                        >
                            <Check size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                            <p className="font-medium" style={{ color: 'var(--primary-dark)' }}>{language === 'nl' ? 'Succesvol Ingepland!' : 'Successfully Scheduled!'}</p>
                            <p className="text-caption text-muted">{language === 'nl' ? 'Je content wordt op de geplande tijd gepubliceerd' : 'Your content will be published at the scheduled time'}</p>
                        </motion.div>
                    ) : (
                        <>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={handlePublish}
                                disabled={isPublishing}
                            >
                                {isPublishing ? (
                                    <>{t('processing')}</>
                                ) : (
                                    <>
                                        <Calendar size={16} /> {t('scheduleAll')}
                                    </>
                                )}
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                                onClick={handlePublish}
                                disabled={isPublishing}
                            >
                                <Send size={16} /> {t('publishNow')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
