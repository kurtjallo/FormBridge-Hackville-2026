'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 selection:text-black">
      {/* Swiss Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#cfd1d4 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-12 border-x border-dashed border-gray-200 min-h-screen flex flex-col">
        
        {/* Navigation */}
        <nav className="py-6 border-b border-gray-900 grid grid-cols-2 md:grid-cols-12 gap-8 items-center" aria-label="Main Navigation">
          <div className="md:col-span-4 font-bold text-xl tracking-tighter flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
            FormBridge
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex md:col-span-8 justify-end items-center space-x-8 text-sm font-medium">
            <span className="text-gray-500">Hackville 2026</span>
            <Link 
              href="/form" 
              className="text-gray-900 border-b border-transparent hover:border-gray-900 transition-colors "
            >
              <b><big>Start Application</big></b> &rarr;
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex justify-end">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 6h16M4 18h16"/></svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="col-span-2 md:hidden pt-4 pb-2 border-t border-dashed border-gray-200 animate-in slide-in-from-top-1 fade-in duration-200">
              <div className="flex flex-col space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Navigation</span>
                <Link href="/form" className="text-lg font-medium hover:text-gray-600">
                  Start Application
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Header / Orientation */}
        <header className="py-12 sm:py-20 border-b border-gray-900 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
              Essential Services. Simplified.
            </h1>
            <p className="text-xl sm:text-2xl font-medium leading-relaxed max-w-2xl text-gray-700">
              A digital clarity system for Ontario Works applications. Designed to reduce cognitive load and guide you with precision.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col justify-between items-start md:items-end">
          </div>
        </header>

        {/* Narrative Section - The Why & How */}
        <main className="flex-grow">
          <section className="py-24 grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Reassurance */}
            <div className="md:col-span-4 pr-8 border-r-0 md:border-r border-dashed border-gray-300">
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">01. Purpose</span>
              <h2 className="text-3xl font-semibold mb-4 tracking-tight">Clarity over complexity.</h2>
              <p className="text-gray-600 leading-relaxed">
                Navigating social assistance shouldn't be a test of endurance. We have removed the noise to focus entirely on your needs. The interface is calm, the language is plain, and help is always one click away.
              </p>
            </div>

            {/* Understanding */}
            <div className="md:col-span-4 pr-8 border-r-0 md:border-r border-dashed border-gray-300">
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">02. Method</span>
              <h2 className="text-3xl font-semibold mb-4 tracking-tight">Structured guidance.</h2>
              <p className="text-gray-600 leading-relaxed">
                Every question is isolated. Every term is explained. Our intelligent assistant is present but never intrusive, offering instant clarification for complex requirements without leaving the page.
              </p>
            </div>

            {/* Empowerment */}
            <div className="md:col-span-4">
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">03. Result</span>
              <h2 className="text-3xl font-semibold mb-4 tracking-tight">Submit with confidence.</h2>
              <p className="text-gray-600 leading-relaxed">
                Review your progress instantly. Validate your information in real-time. By the time you reach the end, you will know—not just hope—that your application is complete and correct.
              </p>
            </div>
          </section>

          <div className="w-full h-px bg-gray-900 mb-16"></div>

          {/* Call to Action */}
          <section className="mb-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
             <div className="md:col-span-8">
               <h3 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                 Ready to begin?
               </h3>
               <p className="text-lg text-gray-600 max-w-xl">
                 No account creation required for this demo. Your session is secure and private.
               </p>
             </div>
             <div className="md:col-span-4 flex justify-start md:justify-end">
               <Link 
                 href="/form"
                 className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-200 bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
               >
                 <span className="mr-3">Start Application</span>
                 <svg 
                   className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" 
                   fill="none" 
                   viewBox="0 0 24 24" 
                   stroke="currentColor"
                 >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
             </div>
          </section>
        </main>
        
        {/* Footer */}
        <footer className="py-8 border-t border-gray-200 text-sm text-gray-500 flex flex-col sm:flex-row justify-between items-center">
            <div className="space-x-6 mb-4 sm:mb-0">
                <span>© 2026 Hackville FormBridge</span>
                <span>Privacy</span>
                <span>Terms</span>
            </div>
            <div className="font-mono text-xs">
                System Status: <span className="text-green-600">● Operational</span>
            </div>
        </footer>
      </div>
    </div>
  );
}
