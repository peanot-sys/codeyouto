import { ProcessingStage } from '../types/media';
import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  progress: number;
  stage: ProcessingStage | null;
}

const stageLabels: Record<ProcessingStage, string> = {
  preparing: 'Preparing your download...',
  processing: 'Processing media...',
  trimming: 'Trimming selected section...',
  converting: 'Converting format...',
  finalizing: 'Finalizing...',
};

export function ProcessingState({ progress, stage }: ProcessingStateProps) {
  return (
    <div className="glass-card p-6 sm:p-8 text-center animate-fade-in-up">
      {/* Animated icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }}
      >
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Preparing your download
      </h3>

      {/* Progress bar */}
      <div className="mt-6 mb-4">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--border-color)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            {stage && stageLabels[stage]}
          </span>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
