import { cn } from '../../lib/cn';

const variants = {
  info: 'border-brand-300/40 bg-brand-25 text-white',
  success: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-50',
  warning: 'border-amber-400/40 bg-amber-500/10 text-amber-50',
  error: 'border-rose-400/40 bg-rose-500/10 text-rose-50',
};

export default function Alert({ variant = 'info', className, children, onClose }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
        variants[variant],
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}


