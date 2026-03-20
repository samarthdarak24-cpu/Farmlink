'use client';

import type { ReactNode } from 'react';

export default function GlassSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-8 sm:py-10">
      <div className="glass-card border border-white/20 rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-3">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-white/20 text-sm font-semibold w-fit">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              <span>{eyebrow}</span>
            </div>
          ) : null}
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

