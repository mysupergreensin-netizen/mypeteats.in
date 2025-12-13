import { cn } from '../../lib/cn';

const baseStyles =
  'inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:opacity-60 disabled:cursor-not-allowed';

const variants = {
  primary:
    'bg-brand-500 hover:bg-brand-400 text-white shadow-glow focus-visible:ring-brand-300',
  secondary:
    'bg-surface-100 text-white hover:bg-surface-200 border border-border-subtle focus-visible:ring-brand-200',
  ghost:
    'bg-transparent text-white/70 hover:text-white hover:bg-surface-100 focus-visible:ring-border-strong',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon: Icon,
  iconPosition = 'right',
  as: Component = 'button',
  href,
  ...props
}) {
  // If href is provided and Component is 'button', use 'a' tag
  if (href && Component === 'button') {
    Component = 'a';
  }

  return (
    <Component
      href={href}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="mr-2 h-5 w-5" aria-hidden="true" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="ml-2 h-5 w-5" aria-hidden="true" />
      )}
    </Component>
  );
}


