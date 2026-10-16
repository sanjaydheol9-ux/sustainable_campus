// ========================================
// Skeleton — Loading placeholder with shimmer
// ========================================

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rect', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        className
      )}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Card-shaped skeleton for dashboard panels */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] p-5',
        className
      )}
    >
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

/** AI thinking indicator — three calm dots */
export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2" role="status" aria-label="AI is thinking">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-[var(--color-accent)]"
          style={{
            opacity: 0.4,
            animation: `thinking 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes thinking {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes thinking {
            0%, 100% { opacity: 0.6; transform: none; }
          }
        }
      `}</style>
    </div>
  );
}
