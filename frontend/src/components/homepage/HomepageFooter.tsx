import Link from 'next/link';
import GlassButton from './GlassButton';
import Container from './Container';

export default function HomepageFooter() {
  return (
    <footer className="relative overflow-hidden bg-gray-950 text-gray-300">
      <div className="absolute inset-0 -z-10 bg-gray-950 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/2" />
      </div>

      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white font-bold text-xl">O</span>
              </span>
              <span className="text-xl font-display font-bold text-white tracking-tight">
                ODOP<span className="text-primary-400">Connect</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              A premium agri-tech marketplace that helps farmers and buyers trade with
              transparent details, traceability, and AI-assisted pricing.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <GlassButton
                href="/auth/register?role=farmer"
                variant="primary"
                className="text-white px-4 py-2 text-sm"
              >
                Join as Farmer
              </GlassButton>
              <GlassButton
                href="/auth/register?role=buyer"
                variant="secondary"
                className="text-white px-4 py-2 text-sm"
              >
                Join as Buyer
              </GlassButton>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-semibold text-white">Platform</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="hover:text-primary-300 transition-colors" href="#features">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary-300 transition-colors"
                    href="#how-it-works"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary-300 transition-colors"
                    href="#testimonials"
                  >
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Company</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link className="hover:text-primary-300 transition-colors" href="/about">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary-300 transition-colors" href="/careers">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary-300 transition-colors" href="/blog">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Support</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link className="hover:text-primary-300 transition-colors" href="/help">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary-300 transition-colors" href="/contact">
                    Contact
                  </Link>
                </li>
                <li>
                  <a className="hover:text-primary-300 transition-colors" href="/privacy">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-gray-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} ODOP Connect. All rights reserved.</p>
          <p className="text-gray-500">
            Built with transparency and trust.
          </p>
        </div>
      </Container>
    </footer>
  );
}

