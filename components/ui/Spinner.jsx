export default function Spinner({ size = 'md' }) {
  const dimension = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  return (
    <div className="inline-flex items-center justify-center">
      <span
        className={`animate-spin rounded-full border-2 border-brand-400/40 border-t-transparent ${dimension}`}
        aria-hidden="true"
      />
    </div>
  );
}


