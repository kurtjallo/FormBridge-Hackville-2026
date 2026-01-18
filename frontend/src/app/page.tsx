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
        <nav className="py-6 border-b border-purple-900 grid grid-cols-2 md:grid-cols-12 gap-8 items-center" aria-label="Main Navigation">
          <div className="md:col-span-4 font-bold text-xl tracking-tighter flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-900 rounded-full"></div>
            FormBridge
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex md:col-span-8 justify-end items-center space-x-8 text-sm font-medium">
            <span className="text-gray-500">Hackville 2026</span>
            <Link
              href="/select"
              className="group inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-purple-900 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-800 transition-all duration-200"
              aria-label="Start your application process"
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
                <Link 
                  href="/select" 
                  className="group inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white bg-purple-900 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-800 transition-all duration-200"
                  aria-label="Start your application process"
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
            </div>
          )}
        </nav>

        {/* Header / Orientation */}
        <header 
          className="py-16 sm:py-24 border-b border-purple-900"
          role="banner"
          aria-labelledby="main-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-8">
              
              <h1 
                id="main-heading"
                className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] mb-8 text-gray-900"
              >
                <span className="block">Essential Services.</span>
                <span className="block text-gray-700">Simplified.</span>
              </h1>
              
              <p 
                className="text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed max-w-3xl text-gray-700 mb-8"
                role="text"
                aria-describedby="main-heading"
              >
                A digital clarity system designed to make government forms accessible and understandable. We reduce cognitive load and guide you with precision through every step.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <Link
                  href="/select"
                  className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-white bg-purple-900 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-800 transition-all duration-200 w-full sm:w-auto"
                  aria-label="Start your application process"
                >
                  <span className="mr-3">Get Started</span>
                  <svg 
                    className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                
                <button
                  className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-medium text-purple-900 border border-purple-500 rounded-lg hover:border-purple-800 hover:text-black hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-800 transition-all duration-200 w-full sm:w-auto"
                  aria-label="Learn more about our services"
                  onClick={() => document.getElementById('process-section-heading')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span>Learn More</span>
                  <svg 
                    className="w-4 h-4 ml-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Narrative Section - The Why & How */}
        <main className="flex-grow" role="main">
          <section 
            className="py-16 sm:py-24" 
            aria-labelledby="process-section-heading"
          >
            <div className="sr-only">
              <h2 id="process-section-heading">Our Three-Step Process</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Reassurance */}
              <article 
                className="flex flex-col h-full focus-within:ring-2 focus-within:ring-offset-4 focus-within:ring-purple-800 rounded-lg p-6 lg:p-8 bg-white border border-transparent hover:border-purple-300 transition-all duration-200"
                role="article"
                aria-labelledby="purpose-heading"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span 
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-900 font-bold text-lg rounded-full"
                    aria-label="Step 1"
                  >
                    1
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Purpose
                  </span>
                </div>
                
                <h3 id="purpose-heading" className="text-2xl lg:text-3xl font-semibold mb-4 tracking-tight text-gray-900">
                  Clarity over complexity
                </h3>
                
                <p className="text-gray-700 leading-relaxed text-base lg:text-lg flex-grow mb-6">
                  Navigating government assistance shouldn't be overwhelming. We've simplified complex forms with clear language, intuitive design, and immediate help when you need it most.
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    ✓ Plain language explanations
                  </span>
                </div>
              </article>

              {/* Understanding */}
              <article 
                className="flex flex-col h-full focus-within:ring-2 focus-within:ring-offset-4 focus-within:ring-purple-800 rounded-lg p-6 lg:p-8 bg-white border border-transparent hover:border-purple-300 transition-all duration-200"
                role="article"
                aria-labelledby="method-heading"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span 
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-900 font-bold text-lg rounded-full"
                    aria-label="Step 2"
                  >
                    2
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Method
                  </span>
                </div>
                
                <h3 id="method-heading" className="text-2xl lg:text-3xl font-semibold mb-4 tracking-tight text-gray-900">
                  Guided step-by-step
                </h3>
                
                <p className="text-gray-700 leading-relaxed text-base lg:text-lg flex-grow mb-6">
                  Each question is presented clearly with context and purpose. Our AI assistant provides instant explanations for any term or requirement, keeping you informed and confident throughout.
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    ✓ AI-powered assistance
                  </span>
                </div>
              </article>

              {/* Empowerment */}
              <article 
                className="flex flex-col h-full focus-within:ring-2 focus-within:ring-offset-4 focus-within:ring-purple-800 rounded-lg p-6 lg:p-8 bg-white border border-transparent hover:border-purple-300 transition-all duration-200"
                role="article"
                aria-labelledby="result-heading"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span 
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-900 font-bold text-lg rounded-full"
                    aria-label="Step 3"
                  >
                    3
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Result
                  </span>
                </div>
                
                <h3 id="result-heading" className="text-2xl lg:text-3xl font-semibold mb-4 tracking-tight text-gray-900">
                  Complete with confidence
                </h3>
                
                <p className="text-gray-700 leading-relaxed text-base lg:text-lg flex-grow mb-6">
                  Real-time validation ensures your information is accurate before submission. Track your progress and review everything carefully before your final application submission.
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    ✓ Instant validation & review
                  </span>
                </div>
              </article>
            </div>
          </section>

        </main>
        
        {/* Footer */}
        <footer className="py-8 border-t border-gray-200 text-sm text-gray-500 flex flex-col sm:flex-row justify-between items-center">
            <div className="space-x-6 mb-4 sm:mb-0">
                <span>© 2026 FormBridge</span>
                <span>Privacy</span>
                <span>Terms</span>
                
            </div>
            <div className="font-mono text-xs">
                <span>Created by: Uzeyr A, Kurt J, Bianca J , Jason T @ Hackville 2026</span>
            </div>
        </footer>
      </div>
    </div>
  );
}
