import { cn } from '../../lib/cn';

const variants = {
  success: 'bg-[#f43f5e] text-[#22c55e] border border-[#28b60c]',
  warning: 'bg-amber-500/15 text-amber-200 border border-amber-400/40',
  danger: 'bg-rose-500/15 text-rose-200 border border-rose-400/40',
  neutral: 'bg-surface-100 text-brand-700 border border-border-subtle',
};

export default function Badge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}


