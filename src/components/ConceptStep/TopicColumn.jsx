import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function TopicColumn({
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
