import React from 'react';
import { useGlobalContext } from './context/GlobalContext';
import ConceptStep from './components/ConceptStep';
import ContentCreationStep from './components/ContentCreationStep';
import VisualAssetsStep from './components/VisualAssetsStep';
import VideoProductionStep from './components/VideoProductionStep';
import ThumbnailStep from './components/ThumbnailStep';
import BlogStep from './components/BlogStep';
import ReviewStep from './components/ReviewStep';
import PublishStep from './components/PublishStep';
import { Box } from 'lucide-react';

const STEPS = [
    'Conceptualization',
    'Content Creation',
    'Visual Assets',
    'Video Production',
    'Video Thumbnails',
    'Blog Post',
    'Unified Review',
    'Publishing'
];

export default function StepRenderer() {
    const { currentStep } = useGlobalContext();

    switch (currentStep) {
        case 1: return <ConceptStep />;
        case 2: return <ContentCreationStep />;
        case 3: return <VisualAssetsStep />;
        case 4: return <VideoProductionStep />;
        case 5: return <ThumbnailStep />;
        case 6: return <BlogStep />;
        case 7: return <ReviewStep />;
        case 8: return <PublishStep />;
        default: return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="workflow-block p-20 flex flex-col items-center gap-8 border-dashed opacity-50">
                    <Box size={40} strokeWidth={1} className="text-slate-700" />
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-heading tracking-widest text-white">SYSTEM MODULE OFFLINE</h3>
                        <p className="max-w-xs text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                            The {STEPS[currentStep - 1]} terminal is currently undergoing phase adjustment.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-4 bg-primary/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                </div>
            </div>
        );
    }
}
