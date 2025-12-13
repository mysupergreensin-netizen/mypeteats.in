import { cn } from '../../lib/cn';

export default function Input({
  label,
  helper,
  error,
  className,
  as = 'input',
  variant = 'dark', // 'dark' or 'light'
  ...props
}) {
  const Element = as === 'textarea' ? 'textarea' : 'input';

  const isLight = variant === 'light';

  return (
    <label className="flex w-full flex-col space-y-2">
      {label && (
        <span className={cn(
          'text-sm font-medium',
          isLight ? 'text-brand-800' : 'text-gray-600'
        )}>
          {label}
        </span>
      )}
      <Element
        className={cn(
          'w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2',
          isLight
            ? 'border-brand-200 bg-white text-brand-800 placeholder:text-brand-400 focus:border-brand-400 focus:ring-brand-400/50'
            : 'border-border-subtle bg-surface-100 text-[#4f4f4f] placeholder:text-white/40 focus:border-brand-300 focus:ring-brand-400/50',
          error && (isLight
            ? 'border-rose-400 text-rose-700 placeholder:text-rose-400/70 focus:border-rose-500 focus:ring-rose-400/60'
            : 'border-rose-400 text-rose-50 placeholder:text-rose-200/70 focus:border-rose-300 focus:ring-rose-400/60'),
          as === 'textarea' && 'min-h-[120px]',
          className
        )}
        {...props}
      />
      {error ? (
        <span className={cn(
          'text-xs',
          isLight ? 'text-rose-600' : 'text-rose-200'
        )}>{error}</span>
      ) : (
        helper && (
          <span className={cn(
            'text-xs',
            isLight ? 'text-brand-600' : 'text-white/60'
          )}>{helper}</span>
        )
      )}
    </label>
  );
}


