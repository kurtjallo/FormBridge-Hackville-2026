'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { useTranslation } from '@/i18n';
import { Language } from '@/types';
import { ChevronRight, ArrowLeft, Upload, Search, FileText, CheckCircle } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';

type Step = 'language' | 'name' | 'intro' | 'review' | 'category-select' | 'form-select';

const STORAGE_KEY = 'formbridge_onboarding';

// Maple the Moose SVG component
function MapleMoose({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`${className} bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-md flex-shrink-0 border-2 border-white`}>
      <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
        <path
          d="M20 35 Q15 20 25 15 Q30 20 28 30 M25 25 Q20 15 30 12"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M80 35 Q85 20 75 15 Q70 20 72 30 M75 25 Q80 15 70 12"
          fill="none"
          stroke="#FFFFFF"
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

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, startTyping]);

  return { displayedText, isComplete };
}

interface FormOption {
  id: string;
  code: string;
  name: string;
  ministry: string;
  category: 'legal' | 'finance' | 'immigration';
  pdfUrl: string;
}

// Database with Legal, Finance, and Immigration forms for demo
// IDs must match SAMPLE_PDF_FORMS in sampleForms.ts for PDF lookup to work
const formsDatabase: FormOption[] = [
  // Legal Forms
  { id: 'basic-nda', code: 'NDA-01', name: 'Non-Disclosure Agreement', ministry: 'Ministry of the Attorney General', category: 'legal', pdfUrl: 'http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf' },
  { id: 'contract-review', code: 'CTR-02', name: 'Standard Service Contract', ministry: 'Ministry of the Attorney General', category: 'legal', pdfUrl: 'http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf' },
  { id: 'power-attorney', code: 'POA-03', name: 'Power of Attorney', ministry: 'Ministry of the Attorney General', category: 'legal', pdfUrl: 'http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf' },

  // Finance Forms
  { id: 'cra-td1', code: 'TD1', name: 'Personal Tax Credits Return', ministry: 'Canada Revenue Agency', category: 'finance', pdfUrl: 'http://localhost:5001/forms/Finance/td1-fill-26e.pdf' },
  { id: 'ontario-works', code: 'OW-APP', name: 'Ontario Works Application', ministry: 'Ministry of Children, Community and Social Services', category: 'finance', pdfUrl: 'http://localhost:5001/forms/Finance/td1-fill-26e.pdf' },
  { id: 'gst-hst', code: 'GST34', name: 'GST/HST Return for Registrants', ministry: 'Canada Revenue Agency', category: 'finance', pdfUrl: 'http://localhost:5001/forms/Finance/td1-fill-26e.pdf' },

  // Immigration Forms
  { id: 'oinp-application', code: 'OINP-01', name: 'Ontario Immigration Nominee Program', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', pdfUrl: 'http://localhost:5001/forms/Immigration/on00596e-immigration-nominee-program.pdf' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const setStoreLanguage = useFormStore((state) => state.setLanguage);

  // State
  const [currentStep, setCurrentStep] = useState<Step>('language');
  const [name, setName] = useState('');
  const [editingField, setEditingField] = useState<'name' | 'language' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'legal' | 'finance' | 'immigration' | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const steps: Step[] = ['language', 'name', 'intro', 'review', 'category-select', 'form-select'];

  // Load session
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name) setName(data.name);
        if (data.language) setStoreLanguage(data.language);
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.completedSteps) setCompletedSteps(new Set(data.completedSteps));
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  }, [setStoreLanguage]);

  // Save session
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      name,
      language,
      currentStep,
      completedSteps: Array.from(completedSteps),
    }));
  }, [name, language, currentStep, completedSteps]);

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    
    // Validation
    if (currentStep === 'name' && !name.trim()) return;

    // Mark current as complete
    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const jumpToStep = (step: Step) => {
    // Can only jump to completed steps or current step
    const stepIndex = steps.indexOf(step);
    const currentIndex = steps.indexOf(currentStep);
    
    // Check if previous steps are completed to allow jumping forward (unlikely in this UI, but good for safety)
    const canJump = stepIndex <= currentIndex || completedSteps.has(steps[stepIndex - 1]);
    
    if (canJump) {
      setCurrentStep(step);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setStoreLanguage(lang);
  };

  const handleFormSelect = (form: FormOption) => {
    sessionStorage.setItem('selectedFormId', form.id);
    sessionStorage.setItem('selectedFormName', form.name);
    sessionStorage.setItem('selectedFormCode', form.code);
    sessionStorage.setItem('selectedFormPdfUrl', form.pdfUrl);
    router.push('/formview');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'language':
        return (
          <div className="space-y-8 transition-all duration-500 ease-out max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-center text-gray-900">{t('onboarding.language.title')}</h1>
            <p className="text-gray-500 text-center">{t('onboarding.language.subtitle')}</p>
            <div className="flex flex-col gap-4 mt-8">
              <button
                onClick={() => handleLanguageSelect('en')}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group ${language === 'en' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-200 shadow-md' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🇬🇧</span>
                    <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">English</div>
                        <div className="text-sm text-gray-500">Continue in English</div>
                    </div>
                    {language === 'en' && <div className="text-purple-600"><CheckCircle size={24} /></div>}
                </div>
              </button>
              <button
                onClick={() => handleLanguageSelect('fr')}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group ${language === 'fr' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-200 shadow-md' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">⚜️</span>
                    <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">Français</div>
                        <div className="text-sm text-gray-500">Continuer en français</div>
                    </div>
                    {language === 'fr' && <div className="text-purple-600"><CheckCircle size={24} /></div>}
                </div>
              </button>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full py-4 bg-purple-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5"
            >
              {t('common.buttons.continue')}
            </button>
          </div>
        );

      case 'name':
        return (
          <div className="space-y-6 max-w-md mx-auto transition-all duration-500 ease-out">
            <h1 className="text-3xl font-bold text-center text-gray-900">{t('onboarding.name.title')}</h1>
            <p className="text-gray-500 text-center">{t('onboarding.name.subtitle')}</p>
            <div className="mt-8">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('onboarding.name.placeholder')}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                onKeyDown={(e) => e.key === 'Enter' && name && handleNext()}
                autoFocus
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full py-4 bg-purple-900 text-white rounded-xl font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t('common.buttons.continue')}
            </button>
          </div>
        );


      case 'intro':
        const IntroContent = () => {
          const { displayedText, isComplete } = useTypewriter(
            t('onboarding.intro.greeting', { name: name }),
            30
          );
          
          return (
            <div className="space-y-12 max-w-2xl mx-auto transition-all duration-500 ease-out mt-8">
              {/* Maple Header */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                    <MapleMoose className="w-20 h-20" />
                </div>
                
                <div className="flex-1">
                    <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-medium min-h-[5rem]">
                        {displayedText}
                        {!isComplete && <span className="animate-pulse inline-block w-3 h-6 ml-1 bg-amber-600 align-middle rounded-full"></span>}
                    </p>
                </div>
              </div>

              {isComplete && (
                <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="w-full sm:w-auto px-8 py-4 bg-purple-900 text-white rounded-xl font-medium hover:bg-black transition-all flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      {t('common.buttons.letsDoIt')}
                      <ChevronRight size={20} />
                    </button>
                </div>
              )}
            </div>
          );
        };
        return <IntroContent />;

      case 'review':
        return (
          <div className="space-y-6 max-w-md mx-auto transition-all duration-500 ease-out">
            <h1 className="text-3xl font-bold text-center text-gray-900">{t('onboarding.review.title')}</h1>
            <p className="text-gray-500 text-center">{t('onboarding.review.subtitle')}</p>
            
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-200 mt-6">
                {/* Name Row */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-100 transition-colors group">
                    <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{t('onboarding.review.nameLabel')}</div>
                        {editingField === 'name' ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingField(null);
                                }}
                                onBlur={() => setEditingField(null)}
                                autoFocus
                                className="w-full bg-white border border-purple-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-100 outline-none text-lg font-medium text-gray-900"
                            />
                        ) : (
                            <div 
                                onClick={() => setEditingField('name')}
                                className="text-lg font-medium text-gray-900 cursor-text"
                            >
                                {name}
                            </div>
                        )}
                    </div>
                    {editingField !== 'name' && (
                        <button 
                            onClick={() => setEditingField('name')}
                            className="text-purple-600 opacity-0 group-hover:opacity-100 text-sm font-medium transition-opacity px-2 py-1"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {/* Language Row */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-100 transition-colors group">
                    <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{t('onboarding.review.languageLabel')}</div>
                        {editingField === 'language' ? (
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={() => { setStoreLanguage('en'); setEditingField(null); }}
                                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${language === 'en' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => { setStoreLanguage('fr'); setEditingField(null); }}
                                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${language === 'fr' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Français
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => setEditingField('language')}
                                className="text-lg font-medium text-gray-900 cursor-pointer"
                            >
                                {language === 'en' ? 'English' : 'Français'}
                            </div>
                        )}
                    </div>
                    {editingField !== 'language' && (
                        <button 
                            onClick={() => setEditingField('language')}
                            className="text-purple-600 opacity-0 group-hover:opacity-100 text-sm font-medium transition-opacity px-2 py-1"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-purple-900 text-white rounded-xl font-medium hover:bg-black transition-all mt-4"
            >
              {t('common.buttons.looksGood')}
            </button>
          </div>
        );

      case 'category-select':
        return (
          <div className="space-y-6 max-w-2xl mx-auto transition-all duration-500 ease-out">
             <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('onboarding.categorySelect.title')}</h1>
                <p className="text-gray-500 mt-2">{t('onboarding.categorySelect.subtitle')}</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {[
                     { id: 'legal', icon: '⚖️' },
                     { id: 'finance', icon: '💰' },
                     { id: 'immigration', icon: '🛂' }
                 ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(cat.id as 'legal' | 'finance' | 'immigration');
                            handleNext();
                        }}
                        className="group relative p-8 rounded-2xl border-2 border-gray-100 bg-white hover:border-purple-500 hover:shadow-lg hover:shadow-purple-100 transition-all duration-300 text-left overflow-hidden"
                    >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{cat.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`onboarding.categories.${cat.id}.title`)}</h3>
                        <p className="text-gray-500 text-sm">{t(`onboarding.categories.${cat.id}.description`)}</p>
                        
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <div className="bg-purple-100 p-2 rounded-full text-purple-700">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </button>
                 ))}
             </div>

             <div className="flex justify-center mt-8">
                 <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all border border-dashed border-transparent hover:border-purple-200"
                 >
                    <Upload size={18} />
                    <span>{t('onboarding.categorySelect.uploadOwnPdf')}</span>
                 </button>
             </div>
          </div>
        );

      case 'form-select':
        const filteredForms = formsDatabase.filter(f => f.category === selectedCategory);
        const searchFiltered = filteredForms.filter(f => 
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            f.code.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
           <div className="space-y-6 max-w-2xl mx-auto transition-all duration-500 ease-out">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {selectedCategory === 'legal' ? t('onboarding.categories.legal.title') : t('onboarding.categories.finance.title')}
                    </h1>
                    <p className="text-sm text-gray-500">{t('onboarding.formSelect.subtitle')}</p>
                </div>
             </div>

             {/* Search Bar */}
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder={t('onboarding.formSelect.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all outline-none"
                    autoFocus
                />
             </div>

             <div className="space-y-3 mt-4">
                {searchFiltered.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {t('onboarding.formSelect.noResults', { query: searchQuery })}
                    </div>
                ) : (
                    searchFiltered.map((form) => (
                        <button 
                            key={form.id}
                            onClick={() => handleFormSelect(form)}
                            className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-purple-500 hover:shadow-md transition-all group flex items-start gap-4"
                        >
                            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-purple-50 transition-colors">
                                <FileText size={24} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{form.name}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md ml-2 whitespace-nowrap">{form.code}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{form.ministry}</p>
                            </div>
                        </button>
                    ))
                )}
             </div>
           </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-purple-100 selection:text-purple-900 overflow-hidden font-sans">
      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <FileUpload
            onUploadSuccess={(result) => {
                setShowUpload(false);
                sessionStorage.setItem('selectedFormId', result.id);
                router.push('/formview');
            }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Modern Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col pt-8 pb-12 px-6">
         {/* Top Navigation / Progress */}
         <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-12">
            <button 
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-gray-900 transition-colors"
                title="Back to Home"
            >
                <img src="/logo.svg" alt="Clarify" className="h-8 w-auto hidden" /> 
                <span className="font-bold text-xl tracking-tight text-gray-900">Clarify</span>
            </button>
            
            {/* Progress Dots */}
            <div className="flex items-center gap-3 bg-gray-50/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100/50">
                {steps.map((step, index) => {
                    const isActive = step === currentStep;
                    const isCompleted = completedSteps.has(step) || steps.indexOf(step) < steps.indexOf(currentStep);
                    const isFuture = !isActive && !isCompleted;
                    
                    return (
                        <div key={step} className="group relative flex items-center justify-center">
                           <button
                             onClick={() => (isCompleted || isActive) && jumpToStep(step)}
                             disabled={isFuture}
                             className={`
                                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                ${isActive ? 'w-8 h-2.5 rounded-full bg-purple-600 shadow-sm' : 'w-2.5 h-2.5 rounded-full hover:scale-125'}
                                ${isCompleted ? 'bg-purple-300 hover:bg-purple-400 cursor-pointer' : ''}
                                ${isFuture ? 'bg-gray-200 cursor-default' : ''}
                             `}
                             aria-label={`Step ${index + 1}: ${step}`}
                           />
                           
                           {/* Tooltip */}
                           <div className={`
                                absolute top-8 left-1/2 -translate-x-1/2 transition-all duration-300 whitespace-nowrap px-3 py-1.5 rounded-lg pointer-events-none z-20 shadow-xl text-xs font-medium border
                                opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                                ${isActive ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-100'}
                                hidden sm:block
                           `}>
                               {t(`onboarding.steps.${step === 'category-select' ? 'categorySelect' : step === 'form-select' ? 'formSelect' : step}`)}
                               {/* Arrow */}
                               <div className={`absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isActive ? 'border-b-gray-900' : 'border-b-white'}`}></div>
                           </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="w-20"></div> {/* Spacer for balance */}
         </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
            <div className="w-full">
                {renderStepContent()}
            </div>
         </div>
      </div>
    </div>
  );
}
