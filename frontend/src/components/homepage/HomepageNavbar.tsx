'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import GlassButton from './GlassButton';
import Container from './Container';

const navLinks = [
  { href: '#top', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#contact', label: 'Contact' },
] as const;

export default function HomepageNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-950/80 backdrop-blur-md border-b border-white/10 shadow-lg py-3' : 'bg-transparent py-5'
      }`}
      aria-label="Primary navigation"
    >
      <Container className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-xl">O</span>
          </span>
          <span className="text-xl font-display font-bold text-white tracking-tight">
            ODOP<span className="text-primary-400">Connect</span>
          </span>
        </Link>

        {/* Desktop Links (Center) */}
        <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 p-1 backdrop-blur-md">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Desktop Actions (Right) */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <GlassButton
            href="/auth/register"
            variant="primary"
            className="text-white text-sm px-5 py-2.5 bg-primary-600 hover:bg-primary-500 border-none shadow-primary-500/20"
          >
            Sign up
          </GlassButton>
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-xl text-gray-300 bg-white/5 backdrop-blur-md border border-white/10 hover:text-white transition-all"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-gray-950 border-b border-white/10"
          >
            <Container className="py-6 flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-lg font-medium text-gray-300 hover:text-white transition-colors py-2 border-b border-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-4">
                <Link
                  href="/auth/login"
                  className="text-lg font-medium text-center text-gray-300 hover:text-white py-3 bg-white/5 rounded-xl border border-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <GlassButton
                  href="/auth/register"
                  variant="primary"
                  className="w-full text-center text-white py-3 text-lg"
                >
                  Sign up
                </GlassButton>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
