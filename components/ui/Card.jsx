import { cn } from '../../lib/cn';

export default function Card({ children, className }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-brand-200 bg-white/95 p-6 shadow-card backdrop-blur-xl text-brand-800',
        className
      )}
    >
      {children}
    </div>
  );
}


