import Link from 'next/link';

export default function Logo({ className = '', showText = true, size = 'default' }) {
  const sizes = {
    small: { logo: 'h-8', text: 'text-sm' },
    default: { logo: 'h-10', text: 'text-lg' },
    large: { logo: 'h-14', text: 'text-2xl' },
  };

  const { logo: logoSize, text: textSize } = sizes[size] || sizes.default;

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {/* Logo SVG from file */}
      <div className={`relative flex items-center ${logoSize}`}>
        <img
          src="/logo.svg"
          alt="MyPetEats Logo"
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Text "MYPETEATS.IN" */}
      {showText && (
        <span className={`${textSize} font-serif font-bold text-white tracking-tight`}>
          MYPETEATS.IN
        </span>
      )}
    </Link>
  );
}
