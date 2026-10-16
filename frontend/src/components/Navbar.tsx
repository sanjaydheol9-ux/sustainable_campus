import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/app');

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--surface)]/90 border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">
              Sustain Operations
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Campus Cockpit
            </span>
          </div>
        </Link>

        {/* Center navigation links (on landing) */}
        {!isDashboard && (
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-[var(--text-secondary)]">
            <a href="#problem" className="hover:text-[var(--text-primary)] transition-colors">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
              How it Works
            </a>
            <a href="#intelligence" className="hover:text-[var(--text-primary)] transition-colors">
              Hybrid Intelligence
            </a>
            <a href="#transparency" className="hover:text-[var(--text-primary)] transition-colors">
              Transparency
            </a>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Simulated / Advisory Tag */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--border)]/40 text-[var(--text-secondary)]">
            <ShieldCheck className="w-3 h-3 text-[var(--color-accent)]" />
            Advisory Twin
          </span>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/40 transition-colors focus:outline-none"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cockpit link button */}
          {!isDashboard ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-xs transition-all duration-200"
            >
              <span>Launch Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/20 transition-all duration-200"
            >
              Public Overview
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
