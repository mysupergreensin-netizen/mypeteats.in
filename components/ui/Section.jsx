import { cn } from '../../lib/cn';

export default function Section({
  children,
  className,
  id,
  background = 'default',
}) {
  const backgrounds = {
    default: 'bg-transparent',
    gradient: 'bg-hero-gradient',
    muted: 'bg-white/5',
  };

  return (
    <section
      id={id}
      className={cn(
        'relative w-full rounded-4xl px-6 py-16 md:px-12',
        backgrounds[background],
        className
      )}
    >
      {children}
    </section>
  );
}


