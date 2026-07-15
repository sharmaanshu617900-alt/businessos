"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Company Brain", href: "#company-brain" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <nav
        className={`w-full max-w-[1200px] transition-all duration-700 ease-out ${
          scrolled
            ? "glass-strong shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            : "glass shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
        } rounded-2xl`}
      >
        <div className="flex items-center justify-between h-[60px] sm:h-[64px] px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="/" className="relative flex items-center group">
            <Logo size="sm" variant="inline" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-100/50"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/15 hover:shadow-xl hover:shadow-gray-900/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100/50"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden pb-5 pt-2 px-5 border-t border-gray-100/50">
            <div className="space-y-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-[14px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100/50 space-y-3">
              <a
                href="/login"
                className="block text-center px-4 py-3 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="block text-center px-4 py-3 rounded-xl bg-gray-900 text-white text-[14px] font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                Start Free
              </a>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
