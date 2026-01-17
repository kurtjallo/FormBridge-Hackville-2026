'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface FormOption {
  id: string;
  title: string;
  description: string;
  available: boolean;
  icon: React.ReactNode;
}

const formOptions: FormOption[] = [
  {
    id: 'ontario-works',
    title: 'Ontario Works',
    description: 'Social assistance',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: 'osap',
    title: 'OSAP',
    description: 'Student loans',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    id: 'ohip',
    title: 'OHIP',
    description: 'Health card',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    id: 'cra-t1',
    title: 'CRA T1',
    description: 'Tax return',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    id: 'upload',
    title: 'Upload PDF',
    description: 'Any form (Beta)',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
];

type Step = 'name' | 'birthday' | 'intro' | 'review' | 'form-select';

const stepLabels: Record<Step, string> = {
  'name': 'Your Name',
  'birthday': 'Birthday',
  'intro': 'Meet Maple',
  'review': 'Review',
  'form-select': 'Select Form',
};

const STORAGE_KEY = 'formbridge_onboarding';

// Maple the Moose SVG component
function MapleMoose({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`${className} bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-md flex-shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
        <path
          d="M20 35 Q15 20 25 15 Q30 20 28 30 M25 25 Q20 15 30 12"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M80 35 Q85 20 75 15 Q70 20 72 30 M75 25 Q80 15 70 12"
          fill="none"
          stroke="#8B4513"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="55" rx="25" ry="28" fill="#D2691E" />
        <ellipse cx="50" cy="68" rx="15" ry="12" fill="#DEB887" />
        <circle cx="40" cy="48" r="5" fill="#2D1B0E" />
        <circle cx="60" cy="48" r="5" fill="#2D1B0E" />
        <circle cx="41" cy="47" r="2" fill="white" />
        <circle cx="61" cy="47" r="2" fill="white" />
        <ellipse cx="50" cy="65" rx="6" ry="4" fill="#2D1B0E" />
        <path
          d="M42 74 Q50 80 58 74"
          fill="none"
          stroke="#2D1B0E"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Typewriter hook
function useTypewriter(text: string, speed: number = 30, startTyping: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!startTyping) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, startTyping]);

  return { displayedText, isComplete };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [showContent, setShowContent] = useState(true);
  const [hoveredStep, setHoveredStep] = useState<Step | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleForms, setVisibleForms] = useState<number>(0);

  // Form data
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [selectedForm, setSelectedForm] = useState('');

  // Review inline editing
  const [editingField, setEditingField] = useState<'name' | 'birthday' | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempBirthday, setTempBirthday] = useState('');

  // Track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // Stagger form buttons animation
  useEffect(() => {
    if (currentStep === 'form-select' && showContent) {
      setVisibleForms(0);
      const timer = setInterval(() => {
        setVisibleForms(prev => {
          if (prev >= formOptions.length) {
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, 80);
      return () => clearInterval(timer);
    }
  }, [currentStep, showContent]);

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name) setName(data.name);
        if (data.birthday) setBirthday(data.birthday);
        if (data.selectedForm) setSelectedForm(data.selectedForm);
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.completedSteps) setCompletedSteps(new Set(data.completedSteps));
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save session to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded) return;

    const data = {
      name,
      birthday,
      selectedForm,
      currentStep,
      completedSteps: Array.from(completedSteps),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [name, birthday, selectedForm, currentStep, completedSteps, isLoaded]);

  const transitionToStep = useCallback((nextStep: Step, markCurrentComplete: boolean = true) => {
    if (markCurrentComplete) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    setShowContent(false);

    setTimeout(() => {
      setCurrentStep(nextStep);
      setTimeout(() => {
        setShowContent(true);
      }, 50);
    }, 300);
  }, [currentStep]);

  const canNavigateToStep = (step: Step): boolean => {
    const steps: Step[] = ['name', 'birthday', 'intro', 'review', 'form-select'];
    const targetIndex = steps.indexOf(step);
    const currentIndex = steps.indexOf(currentStep);

    // Can always go back to completed steps
    if (completedSteps.has(step)) return true;

    // Can go to current step
    if (step === currentStep) return true;

    // Can't skip ahead
    if (targetIndex > currentIndex && !completedSteps.has(steps[targetIndex - 1])) return false;

    return targetIndex <= currentIndex;
  };

  const handleStepClick = (step: Step) => {
    if (canNavigateToStep(step) && step !== currentStep) {
      transitionToStep(step, false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      transitionToStep('birthday');
    }
  };

  const handleBirthdaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidDate(birthday)) {
      transitionToStep('intro');
    }
  };

  const handleIntroComplete = () => {
    transitionToStep('review');
  };

  const handleReviewComplete = () => {
    transitionToStep('form-select');
  };

  const handleFormSelect = (formId: string) => {
    const form = formOptions.find(f => f.id === formId);
    if (form?.available) {
      setSelectedForm(formId);
      // Store user data in sessionStorage for the form
      sessionStorage.setItem('userName', name);
      sessionStorage.setItem('userBirthday', birthday);
      sessionStorage.setItem('selectedForm', formId);
      // Clear onboarding data after successful completion
      localStorage.removeItem(STORAGE_KEY);
      router.push('/form');
    }
  };

  const goBack = () => {
    const steps: Step[] = ['name', 'birthday', 'intro', 'review', 'form-select'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      transitionToStep(steps[currentIndex - 1], false);
    }
  };

  // Date validation and formatting
  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}/${numbers.slice(4, 6)}/${numbers.slice(6, 8)}`;
    }
  };

  const isValidDate = (dateStr: string): boolean => {
    if (dateStr.length !== 10) return false;
    const [year, month, day] = dateStr.split('/').map(Number);
    if (!year || !month || !day) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!isValidDate(dateStr)) return dateStr;
    const [year, month, day] = dateStr.split('/');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setBirthday(formatted);
  };

  const steps: Step[] = ['name', 'birthday', 'intro', 'review', 'form-select'];

  const introMessage = `Hey ${name}! I'm Maple the Moose — your friendly guide through the paperwork wilderness. I'll help you every step of the way. Let's get started, eh?`;

  const { displayedText, isComplete } = useTypewriter(
    introMessage,
    20,
    currentStep === 'intro' && showContent
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 selection:text-black overflow-hidden">
      {/* Swiss Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#cfd1d4 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 h-screen flex flex-col items-center justify-center px-6 py-8">
        {/* Progress indicator with tooltips */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 items-center">
          {steps.map((step) => {
            const isActive = currentStep === step;
            const isCompleted = completedSteps.has(step);
            const canClick = canNavigateToStep(step);
            const isHovered = hoveredStep === step;

            return (
              <div key={step} className="relative">
                {isHovered && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md shadow-lg z-50">
                    {stepLabels[step]}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                )}
                <button
                  onClick={() => handleStepClick(step)}
                  onMouseEnter={() => setHoveredStep(step)}
                  onMouseLeave={() => setHoveredStep(null)}
                  disabled={!canClick}
                  aria-label={`Go to ${stepLabels[step]}${isActive ? ' (current)' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    canClick ? 'cursor-pointer' : 'cursor-not-allowed'
                  } ${
                    isActive
                      ? 'bg-gray-900 w-6'
                      : isCompleted
                      ? 'bg-gray-900 w-2.5 hover:scale-150'
                      : 'bg-gray-300 w-2.5'
                  } ${isHovered && canClick ? 'scale-150' : ''}`}
                />
              </div>
            );
          })}
        </div>

        {/* Step label */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Step {steps.indexOf(currentStep) + 1} of {steps.length}
        </div>

        {/* Content container */}
        <div
          className={`w-full max-w-sm transition-all duration-300 ease-out ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Step 1: Name */}
          {currentStep === 'name' && (
            <form onSubmit={handleNameSubmit} className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">
                What's your name?
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                We'll use this to personalize your experience.
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                className="w-full max-w-xs mx-auto block text-center text-base font-medium bg-gray-50 text-gray-900 border-2 border-gray-700 focus:border-gray-900 outline-none py-3 px-4 rounded-xl transition-all duration-200 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className={`mt-8 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  name.trim()
                    ? 'bg-gray-900 text-white hover:bg-gray-600 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 2: Birthday */}
          {currentStep === 'birthday' && (
            <form onSubmit={handleBirthdaySubmit} className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">
                When's your birthday?
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                This helps verify eligibility for programs.
              </p>
              <input
                type="text"
                value={birthday}
                onChange={handleDateChange}
                placeholder="YYYY/MM/DD"
                maxLength={10}
                autoFocus
                className="w-full max-w-xs mx-auto block text-center text-base font-medium bg-gray-50 text-gray-900 border-2 border-gray-700 focus:border-gray-900 outline-none py-3 px-4 rounded-xl transition-all duration-200 placeholder:text-gray-400 font-mono tracking-wider"
              />
              {birthday && !isValidDate(birthday) && birthday.length === 10 && (
                <p className="text-red-500 text-xs mt-2">Please enter a valid date</p>
              )}
              <div className="mt-8 flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isValidDate(birthday)}
                  className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isValidDate(birthday)
                      ? 'bg-gray-900 text-white hover:bg-gray-600 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Intro with Maple */}
          {currentStep === 'intro' && (
            <div className="text-left">
              <div className="flex items-start gap-3">
                <MapleMoose className="w-10 h-10" />
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-800 leading-relaxed">
                    {displayedText}
                    {!isComplete && (
                      <span className="inline-block w-0.5 h-5 bg-gray-900 ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
              <div className={`mt-8 flex gap-3 justify-center transition-all duration-300 ${isComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleIntroComplete}
                  disabled={!isComplete}
                  className="px-6 py-3 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-600 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && (
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">
                Review your info
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Click any field to edit it directly.
              </p>

              <div className="space-y-3 mb-6">
                {/* Name Field */}
                <div className="w-full max-w-xs mx-auto">
                  {editingField === 'name' ? (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border-2 border-gray-700">
                      <span className="text-xs text-gray-500 uppercase tracking-wider px-1">Name</span>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        autoFocus
                        className="flex-1 text-right font-medium text-gray-900 bg-transparent outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tempName.trim()) {
                            setName(tempName);
                            setEditingField(null);
                          } else if (e.key === 'Escape') {
                            setEditingField(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (tempName.trim()) {
                            setName(tempName);
                            setEditingField(null);
                          }
                        }}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTempName(name);
                        setEditingField('name');
                      }}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                    >
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Name</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{name}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-gray-600">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>

                {/* Birthday Field */}
                <div className="w-full max-w-xs mx-auto">
                  {editingField === 'birthday' ? (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border-2 border-gray-700">
                      <span className="text-xs text-gray-500 uppercase tracking-wider px-1">Birthday</span>
                      <input
                        type="text"
                        value={tempBirthday}
                        onChange={(e) => setTempBirthday(formatDateInput(e.target.value))}
                        placeholder="YYYY/MM/DD"
                        maxLength={10}
                        autoFocus
                        className="flex-1 text-right font-medium text-gray-900 bg-transparent outline-none font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isValidDate(tempBirthday)) {
                            setBirthday(tempBirthday);
                            setEditingField(null);
                          } else if (e.key === 'Escape') {
                            setEditingField(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (isValidDate(tempBirthday)) {
                            setBirthday(tempBirthday);
                            setEditingField(null);
                          }
                        }}
                        disabled={!isValidDate(tempBirthday)}
                        className={`p-1 ${isValidDate(tempBirthday) ? 'text-green-600 hover:text-green-700' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTempBirthday(birthday);
                        setEditingField('birthday');
                      }}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                    >
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Birthday</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{formatDisplayDate(birthday)}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-gray-600">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleReviewComplete}
                  disabled={editingField !== null}
                  className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    editingField !== null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-600'
                  }`}
                >
                  Looks good!
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Form Selection */}
          {currentStep === 'form-select' && (
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter mb-2">
                Select a form
              </h1>
              <p className="text-gray-500 text-xs mb-4">
                Choose the form you need help with
              </p>

              <div className="space-y-2 mb-4">
                {formOptions.map((form, index) => (
                  <button
                    key={form.id}
                    onClick={() => handleFormSelect(form.id)}
                    disabled={!form.available}
                    style={{
                      opacity: index < visibleForms ? 1 : 0,
                      transform: index < visibleForms ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                      form.available
                        ? 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                        : 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${form.available ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                      {form.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium text-sm ${form.available ? 'text-gray-900' : 'text-gray-500'}`}>
                          {form.title}
                        </h3>
                        {!form.available && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${form.available ? 'text-gray-500' : 'text-gray-400'}`}>
                        {form.description}
                      </p>
                    </div>
                    {form.available && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-all duration-200"
              >
                ← Back to review
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-[10px] text-gray-400">
          © 2026 Hackville FormBridge
        </div>
      </div>
    </div>
  );
}
