import type { ReactNode } from 'react';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: 'left' | 'center';
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow ? (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-white/20 text-sm font-semibold ${
            align === 'center' ? 'justify-center' : ''
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          <span>{eyebrow}</span>
        </div>
      ) : null}
      <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
        {title}
      </h2>
      {description ? <div className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">{description}</div> : null}
    </div>
  );
}

