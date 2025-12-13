import { cn } from '../../lib/cn';

const sizes = {
  h1: 'text-4xl md:text-6xl font-semibold tracking-tight',
  h2: 'text-3xl md:text-5xl font-semibold tracking-tight',
  h3: 'text-2xl md:text-4xl font-semibold tracking-tight',
  h4: 'text-xl md:text-3xl font-semibold tracking-tight',
};

export default function Heading({
  as = 'h2',
  children,
  className,
  eyebrow,
  subtext,
}) {
  const Element = as;

  return (
    <div className="space-y-4">
      {eyebrow && (
        <p className="pill bg-surface-100 text-white/80 uppercase tracking-[0.3em]">
          {eyebrow}
        </p>
      )}
      <Element className={cn(sizes[as], className)}>{children}</Element>
      {subtext && (
        <p className="max-w-3xl text-lg text-white/70 font-body">{subtext}</p>
      )}
    </div>
  );
}


