import { useState, useRef, useCallback, useEffect } from 'react';
import { formatTime } from '../utils/time';
import { Scissors } from 'lucide-react';

interface TimelineEditorProps {
  duration: number;
  startTime: number;
  endTime: number;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
}

export function TimelineEditor({
  duration,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: TimelineEditorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(percent * duration);
    },
    [duration]
  );

  const handlePointerDown = useCallback(
    (handle: 'start' | 'end') => (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(handle);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const time = getTimeFromPosition(e.clientX);
      
      if (dragging === 'start') {
        const clampedTime = Math.max(0, Math.min(time, endTime - 1));
        onStartChange(clampedTime);
      } else {
        const clampedTime = Math.min(duration, Math.max(time, startTime + 1));
        onEndChange(clampedTime);
      }
    },
    [dragging, getTimeFromPosition, startTime, endTime, duration, onStartChange, onEndChange]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) return;
      const time = getTimeFromPosition(e.clientX);
      const distToStart = Math.abs(time - startTime);
      const distToEnd = Math.abs(time - endTime);
      
      if (distToStart < distToEnd) {
        onStartChange(Math.max(0, Math.min(time, endTime - 1)));
      } else {
        onEndChange(Math.min(duration, Math.max(time, startTime + 1)));
      }
    },
    [dragging, getTimeFromPosition, startTime, endTime, duration, onStartChange, onEndChange]
  );

  const selectedDuration = endTime - startTime;

  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Scissors size={14} />
          Select Range
        </label>
        <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{
          background: 'rgba(99, 102, 241, 0.1)',
          color: '#6366f1',
        }}>
          Selected: {formatTime(selectedDuration)}
        </span>
      </div>

      {/* Timeline */}
      <div className="glass-card-sm p-4 sm:p-5">
        {/* Timeline track */}
        <div
          ref={trackRef}
          className="timeline-track relative"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleTrackClick}
          role="slider"
          aria-label="Timeline selection"
          aria-valuemin={0}
          aria-valuemax={duration}
        >
          {/* Background track */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
            }}
          />

          {/* Unselected regions (muted) */}
          <div
            className="absolute top-0 bottom-0 left-0 rounded-l-xl"
            style={{
              width: `${startPercent}%`,
              background: 'rgba(100, 116, 139, 0.15)',
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 rounded-r-xl"
            style={{
              width: `${100 - endPercent}%`,
              background: 'rgba(100, 116, 139, 0.15)',
            }}
          />

          {/* Selected region */}
          <div
            className="absolute top-0 bottom-0 rounded-lg transition-all duration-75"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          />

          {/* Waveform visualization (decorative) */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl pointer-events-none">
            <div className="flex items-end gap-px h-6 opacity-30">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{
                    height: `${Math.random() * 100}%`,
                    minHeight: '4px',
                    background: 'var(--text-muted)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Start handle */}
          <div
            className="timeline-handle timeline-handle-start"
            style={{ left: `${startPercent}%` }}
            onPointerDown={handlePointerDown('start')}
            role="slider"
            aria-label="Start time handle"
            aria-valuenow={startTime}
            aria-valuemin={0}
            aria-valuemax={endTime}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onStartChange(Math.min(startTime + 1, endTime - 1));
              if (e.key === 'ArrowLeft') onStartChange(Math.max(startTime - 1, 0));
            }}
          />

          {/* End handle */}
          <div
            className="timeline-handle timeline-handle-end"
            style={{ left: `${endPercent}%` }}
            onPointerDown={handlePointerDown('end')}
            role="slider"
            aria-label="End time handle"
            aria-valuenow={endTime}
            aria-valuemin={startTime}
            aria-valuemax={duration}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onEndChange(Math.min(endTime + 1, duration));
              if (e.key === 'ArrowLeft') onEndChange(Math.max(endTime - 1, startTime + 1));
            }}
          />
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>00:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-3">
        <TimeInput
          label="Start"
          value={startTime}
          max={endTime - 1}
          onChange={onStartChange}
        />
        <TimeInput
          label="End"
          value={endTime}
          min={startTime + 1}
          max={duration}
          onChange={onEndChange}
        />
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>Total: {formatTime(duration)}</span>
        <span>Start: {formatTime(startTime)}</span>
        <span>End: {formatTime(endTime)}</span>
        <span className="font-medium" style={{ color: '#6366f1' }}>
          Duration: {formatTime(selectedDuration)}
        </span>
      </div>
    </div>
  );
}

// Time Input subcomponent
interface TimeInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (time: number) => void;
}

function TimeInput({ label, value, min = 0, max, onChange }: TimeInputProps) {
  const [inputValue, setInputValue] = useState(formatTime(value));

  useEffect(() => {
    setInputValue(formatTime(value));
  }, [value]);

  const handleBlur = () => {
    const parts = inputValue.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = (parts[0] || 0) * 60 + (parts[1] || 0);
    } else if (parts.length === 3) {
      seconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }
    
    if (max !== undefined) seconds = Math.min(seconds, max);
    seconds = Math.max(seconds, min);
    
    onChange(seconds);
    setInputValue(formatTime(seconds));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div className="glass-card-sm p-3">
      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-none outline-none text-lg font-mono font-medium"
        style={{ color: 'var(--text-primary)' }}
        aria-label={`${label} time`}
      />
    </div>
  );
}
