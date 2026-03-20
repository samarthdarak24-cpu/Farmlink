import type { ReactNode } from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'outline';

export default function GlassButton({
  href,
  variant = 'primary',
  className = '',
  children,
}: {
  href?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  const base =
    'relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200 focus-ring select-none text-inherit';

  const variantClass =
    variant === 'primary'
      ? 'bg-white/10 backdrop-blur-xl border border-white/25 hover:border-white/40 hover:bg-white/15 hover:shadow-xl hover:shadow-primary-500/10'
      : variant === 'secondary'
        ? 'bg-white/5 backdrop-blur-xl border border-white/20 hover:border-white/35 hover:shadow-xl hover:shadow-secondary-500/10'
        : 'bg-transparent border border-white/30 hover:bg-white/10 hover:border-white/45';

  const shine =
    'pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30';

  const content = (
    <>
      <span className={shine} />
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${variantClass} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={`${base} ${variantClass} ${className}`}>
      {content}
    </button>
  );
}

