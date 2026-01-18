'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryOption {
  id: string;
  title: string;
  description: string;
  available: boolean;
  icon: React.ReactNode;
}

interface FormOption {
  id: string;
  code: string;
  name: string;
  ministry: string;
  category: string;
  popular?: boolean;
}

// Ontario Government Forms Database (from Central Forms Repository)
const formsDatabase: FormOption[] = [
  // Financial Forms - T4 at the top for demo
  { id: 't4-statement', code: 'T4', name: 'T4 Statement of Remuneration Paid', ministry: 'Canada Revenue Agency', category: 'financial', popular: true },
  { id: 'ontario-works', code: 'OW-APP', name: 'Ontario Works Application', ministry: 'Ministry of Children, Community and Social Services', category: 'financial', popular: true },
  { id: '013-0169', code: '013-0169', name: 'Retail Sales Tax Exemption - Addendum to Sworn Statement', ministry: 'Ministry of Finance', category: 'financial', popular: true },
  { id: '013-9983', code: '013-9983', name: 'Notice of Objection', ministry: 'Ministry of Finance', category: 'financial', popular: true },
  { id: 'on00646', code: 'on00646', name: 'ODSP - Mandatory Special Necessities Benefit Application', ministry: 'Ministry of Children, Community and Social Services', category: 'financial', popular: true },
  { id: '014-4819-67', code: '014-4819-67', name: 'Application for Funding Orthotic Devices', ministry: 'Ministry of Health', category: 'financial' },
  { id: '014-4824-67', code: '014-4824-67', name: 'Application for Funding Visual Aids', ministry: 'Ministry of Health', category: 'financial' },

  // Health Forms
  { id: '014-5048-45', code: '014-5048-45', name: 'AEMCA Examination Application', ministry: 'Ministry of Health', category: 'health', popular: true },
  { id: 'on00413', code: 'on00413', name: 'Medical Assistance In Dying (MAiD) Death Report', ministry: 'Ministry of Health', category: 'health', popular: true },
  { id: 'on00843', code: 'on00843', name: 'Tuition Support Program for Nurses - Return of Service Agreement', ministry: 'Ministry of Health', category: 'health' },
  { id: 'on00817', code: 'on00817', name: 'Northern Health Travel Grant Application', ministry: 'Ministry of Health', category: 'health', popular: true },
  { id: '014-4872-88', code: '014-4872-88', name: 'Application for Northern Physician Retention Initiative', ministry: 'Ministry of Health', category: 'health' },
  { id: '014-4422-84', code: '014-4422-84', name: 'Laboratory Requisition - Requisitioning Physician', ministry: 'Ministry of Health', category: 'health' },

  // Labor Forms
  { id: '022-89-1889', code: '022-89-1889', name: 'Better Jobs Ontario Application', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'labor', popular: true },
  { id: 'on00587', code: 'on00587', name: '2026 Summer Employment Opportunities Program Guidelines', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'labor', popular: true },
  { id: 'on00905', code: 'on00905', name: 'Apply for an Extended Temporary Lay-Off', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'labor', popular: true },
  { id: '016-1973', code: '016-1973', name: 'Application for Employment - Employment Standards Officer', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'labor' },
  { id: 'on00597', code: 'on00597', name: 'Apprenticeship TDA Approval Process Guidelines', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'labor' },
  { id: 'on00614', code: 'on00614', name: 'Service Provider EOIS-APPR Registration', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'labor' },

  // Immigration Forms - Work Permits, LMIA, PR, and Provincial Nominee
  { id: 'lmia-application', code: 'EMP5593', name: 'Labour Market Impact Assessment (LMIA) Application', ministry: 'Employment and Social Development Canada', category: 'immigration', popular: true },
  { id: 'lmia-high-wage', code: 'EMP5626', name: 'LMIA Application - High-Wage Position', ministry: 'Employment and Social Development Canada', category: 'immigration', popular: true },
  { id: 'lmia-low-wage', code: 'EMP5627', name: 'LMIA Application - Low-Wage Position', ministry: 'Employment and Social Development Canada', category: 'immigration', popular: true },
  { id: 'lmia-agricultural', code: 'EMP5389', name: 'LMIA Application - Agricultural Stream', ministry: 'Employment and Social Development Canada', category: 'immigration' },
  { id: 'lmia-global-talent', code: 'EMP5624', name: 'LMIA Application - Global Talent Stream', ministry: 'Employment and Social Development Canada', category: 'immigration', popular: true },
  { id: 'work-permit', code: 'IMM1295', name: 'Application for Work Permit Made Outside of Canada', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'work-permit-inside', code: 'IMM5710', name: 'Application to Change Conditions or Extend Stay as a Worker', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'pgwp', code: 'IMM5710', name: 'Post-Graduation Work Permit (PGWP) Application', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'open-work-permit', code: 'IMM5710', name: 'Open Work Permit Application', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'pr-express-entry', code: 'IMM0008', name: 'Generic Application Form for Canada - Express Entry', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'pr-family-sponsor', code: 'IMM1344', name: 'Application to Sponsor, Sponsorship Agreement and Undertaking', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'pr-family-spouse', code: 'IMM5532', name: 'Relationship Information and Sponsorship Evaluation', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'pr-pnp', code: 'IMM0008', name: 'Provincial Nominee Program (PNP) Application', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'oinp-skilled-worker', code: 'OINP-001', name: 'Ontario Immigrant Nominee Program - Skilled Worker Stream', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'immigration', popular: true },
  { id: 'oinp-masters-grad', code: 'OINP-002', name: 'Ontario Immigrant Nominee Program - Masters Graduate Stream', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'immigration', popular: true },
  { id: 'oinp-phd-grad', code: 'OINP-003', name: 'Ontario Immigrant Nominee Program - PhD Graduate Stream', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'immigration' },
  { id: 'oinp-employer-job-offer', code: 'OINP-004', name: 'Ontario Immigrant Nominee Program - Employer Job Offer', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'immigration' },
  { id: 'oinp-entrepreneur', code: 'OINP-005', name: 'Ontario Immigrant Nominee Program - Entrepreneur Stream', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'immigration' },
  { id: 'pr-card-renewal', code: 'IMM5444', name: 'Application for a Permanent Resident Card', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'pr-travel-doc', code: 'IMM5524', name: 'Application for a Permanent Resident Travel Document', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'citizenship-adult', code: 'CIT0002', name: 'Application for Canadian Citizenship - Adults', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'citizenship-minor', code: 'CIT0003', name: 'Application for Canadian Citizenship - Minors', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'study-permit', code: 'IMM1294', name: 'Application for Study Permit Made Outside of Canada', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration', popular: true },
  { id: 'study-permit-extend', code: 'IMM5709', name: 'Application to Change Conditions or Extend Stay as a Student', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'visitor-visa', code: 'IMM5257', name: 'Application for Visitor Visa (Temporary Resident Visa)', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'super-visa', code: 'IMM5257', name: 'Application for Super Visa - Parents and Grandparents', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'eta', code: 'IMM5257', name: 'Electronic Travel Authorization (eTA) Application', ministry: 'Immigration, Refugees and Citizenship Canada', category: 'immigration' },
  { id: 'on00917', code: 'on00917', name: 'Commissioner and Notary Public Application', ministry: 'Ministry of the Attorney General', category: 'immigration' },
  { id: 'on00684', code: 'on00684', name: 'EOIS-APPR Initial Application for Access for an Employer Subscriber', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'immigration' },
  { id: 'on00685', code: 'on00685', name: 'EOIS-APPR Application for Access for a Training Delivery Agent', ministry: 'Ministry of Labour, Immigration, Training and Skills Development', category: 'immigration' },

  // Children, Community & Social Services Forms
  { id: 'on00860', code: 'on00860', name: 'Complex Special Needs (CSN) Referral Screener', ministry: 'Ministry of Children, Community and Social Services', category: 'children-community', popular: true },
  { id: 'on00859', code: 'on00859', name: 'Coordinated Service Plan', ministry: 'Ministry of Children, Community and Social Services', category: 'children-community', popular: true },
  { id: 'on00910', code: 'on00910', name: 'Seniors Active Living Centres Program Guidelines', ministry: 'Ministry for Seniors and Accessibility', category: 'children-community' },
  { id: 'on00059', code: 'on00059', name: 'Animal Welfare Services Complaint Form', ministry: 'Ministry of Agriculture, Food and Rural Affairs', category: 'children-community' },

  // Public & Business Services Forms
  { id: 'on00724', code: 'on00724', name: 'Community Sport and Recreation Infrastructure Fund', ministry: 'Ministry of Public and Business Service Delivery', category: 'public-business', popular: true },
  { id: 'on00891', code: 'on00891', name: 'OPP Special Constable Public Complaint Form', ministry: 'Ministry of the Solicitor General', category: 'public-business', popular: true },
  { id: '008-0149', code: '008-0149', name: 'Invoice for Transportation of Dead Body', ministry: 'Ministry of the Solicitor General', category: 'public-business' },
  { id: 'on00784', code: 'on00784', name: 'Private Gas Well Licence Application', ministry: 'Ministry of Natural Resources and Forestry', category: 'public-business' },
  { id: '012-2132', code: '012-2132', name: 'Operator-in-Training Certificate and Licence Issuance', ministry: 'Ministry of Environment, Conservation and Parks', category: 'public-business' },
  { id: '012-2130', code: '012-2130', name: 'Examination Registration', ministry: 'Ministry of Environment, Conservation and Parks', category: 'public-business' },
];

const categoryOptions: CategoryOption[] = [
  {
    id: 'financial',
    title: 'Financial',
    description: 'Taxes, benefits, assistance programs',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'health',
    title: 'Health',
    description: 'Healthcare, insurance, medical forms',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    id: 'labor',
    title: 'Labor',
    description: 'Employment, workplace, unions',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7h-9M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
      </svg>
    ),
  },
  {
    id: 'immigration',
    title: 'Immigration',
    description: 'Visas, permits, citizenship',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'children-community',
    title: 'Children, Community & Social Services',
    description: 'Family services, childcare, social support',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'public-business',
    title: 'Public & Business Services',
    description: 'Licenses, permits, registrations',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4" />
        <path d="M5 21V10.85M19 21V10.85" />
      </svg>
    ),
  },
];

type Step = 'name' | 'birthday' | 'intro' | 'review' | 'category-select' | 'form-select';

const stepLabels: Record<Step, string> = {
  'name': 'Your Name',
  'birthday': 'Birthday',
  'intro': 'Meet Maple',
  'review': 'Review',
  'category-select': 'Category',
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Review inline editing
  const [editingField, setEditingField] = useState<'name' | 'birthday' | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempBirthday, setTempBirthday] = useState('');

  // Track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // Get forms for selected category OR search across all forms
  const categoryForms = formsDatabase.filter(form => form.category === selectedCategory);

  // When searching, search ALL forms by name or code only
  const filteredForms = searchQuery
    ? formsDatabase.filter(form =>
        form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryForms;
  const popularForms = categoryForms.filter(form => form.popular);

  // Check if search results include forms from other categories
  const hasOtherCategoryResults = searchQuery && filteredForms.some(form => form.category !== selectedCategory);

  // Helper to get category title by id
  const getCategoryTitle = (categoryId: string) => categoryOptions.find(c => c.id === categoryId)?.title || categoryId;

  // Stagger buttons animation
  useEffect(() => {
    if ((currentStep === 'category-select' || currentStep === 'form-select') && showContent) {
      setVisibleForms(0);
      const itemCount = currentStep === 'category-select' ? categoryOptions.length : filteredForms.length;
      const timer = setInterval(() => {
        setVisibleForms(prev => {
          if (prev >= itemCount) {
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, 80);
      return () => clearInterval(timer);
    }
  }, [currentStep, showContent, filteredForms.length]);

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name) setName(data.name);
        if (data.birthday) setBirthday(data.birthday);
        if (data.selectedCategory) setSelectedCategory(data.selectedCategory);
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
      selectedCategory,
      selectedForm,
      currentStep,
      completedSteps: Array.from(completedSteps),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [name, birthday, selectedCategory, selectedForm, currentStep, completedSteps, isLoaded]);

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
    const steps: Step[] = ['name', 'birthday', 'intro', 'review', 'category-select', 'form-select'];
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
    transitionToStep('category-select');
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = categoryOptions.find((c: CategoryOption) => c.id === categoryId);
    if (category?.available) {
      setSelectedCategory(categoryId);
      setSearchQuery(''); // Reset search when changing category
      transitionToStep('form-select');
    }
  };

  const handleFormSelect = (formId: string) => {
    const form = formsDatabase.find((f: FormOption) => f.id === formId);
    if (form) {
      setSelectedForm(formId);
      // Store user data in sessionStorage for the form
      sessionStorage.setItem('userName', name);
      sessionStorage.setItem('userBirthday', birthday);
      sessionStorage.setItem('selectedCategory', selectedCategory);
      sessionStorage.setItem('selectedForm', formId);
      sessionStorage.setItem('selectedFormName', form.name);
      sessionStorage.setItem('selectedFormCode', form.code);
      // Clear onboarding data after successful completion
      localStorage.removeItem(STORAGE_KEY);
      router.push('/formview');
    }
  };

  const goBack = () => {
    const steps: Step[] = ['name', 'birthday', 'intro', 'review', 'category-select', 'form-select'];
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

  const steps: Step[] = ['name', 'birthday', 'intro', 'review', 'category-select', 'form-select'];

  const introMessage = `Hey ${name}! I'm Maple the Moose! Your friendly guide through the paperwork wilderness. I'll help you every step of the way. Let's get started, eh?`;

  // Get category title for form selection header
  const selectedCategoryTitle = categoryOptions.find(c => c.id === selectedCategory)?.title || '';

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
          className={`w-full transition-all duration-300 ease-out ${
            (currentStep === 'category-select' || currentStep === 'form-select') ? 'max-w-xl' : 'max-w-sm'
          } ${
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
                  Let's do it!
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

          {/* Step 5: Category Selection */}
          {currentStep === 'category-select' && (
            <div className="text-center w-full max-w-xl mx-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter mb-2">
                Select a category
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                Which category best fits your form?
              </p>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-[50vh] overflow-y-auto">
                {categoryOptions.map((category: CategoryOption, index: number) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    disabled={!category.available}
                    style={{
                      opacity: index < visibleForms ? 1 : 0,
                      transform: index < visibleForms ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                    }}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 sm:gap-4 ${
                      category.available
                        ? 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                        : 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className={`p-2 sm:p-2.5 rounded-lg ${category.available ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium text-sm sm:text-base ${category.available ? 'text-gray-900' : 'text-gray-500'}`}>
                          {category.title}
                        </h3>
                        {!category.available && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm ${category.available ? 'text-gray-500' : 'text-gray-400'}`}>
                        {category.description}
                      </p>
                    </div>
                    {category.available && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-all duration-200"
              >
                ← Back to review
              </button>
            </div>
          )}

          {/* Step 6: Form Selection */}
          {currentStep === 'form-select' && (
            <div className="text-center w-full max-w-xl mx-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter mb-2">
                {searchQuery ? 'Search Results' : `${selectedCategoryTitle} Forms`}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                Search by name or form code
              </p>

              {/* Search Input */}
              <div className="relative mb-4 sm:mb-5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by form name or code..."
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 text-gray-900 border-2 border-gray-200 focus:border-gray-400 outline-none rounded-xl transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              {/* Search results info */}
              {searchQuery && (
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {filteredForms.length} {filteredForms.length === 1 ? 'result' : 'results'} found
                    {hasOtherCategoryResults && ' across all categories'}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}

              {/* Popular Forms Label */}
              {!searchQuery && popularForms.length > 0 && (
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Popular Forms</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}

              {/* Forms List */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-[40vh] sm:max-h-[45vh] overflow-y-auto">
                {filteredForms.length > 0 ? (
                  filteredForms.map((form: FormOption, index: number) => (
                    <button
                      key={form.id}
                      onClick={() => handleFormSelect(form.id)}
                      style={{
                        opacity: index < visibleForms ? 1 : 0,
                        transform: index < visibleForms ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                      }}
                      className="w-full text-left p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-center gap-3 sm:gap-4"
                    >
                      {/* Form code as main identifier */}
                      <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-gray-900 text-white font-mono text-xs sm:text-sm font-semibold flex-shrink-0 min-w-[60px] sm:min-w-[70px] text-center">
                        {form.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                            {form.name}
                          </h3>
                          {form.popular && !searchQuery && (
                            <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded flex-shrink-0">
                              Popular
                            </span>
                          )}
                          {/* Show category badge when searching across all categories */}
                          {searchQuery && (
                            <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded flex-shrink-0">
                              {getCategoryTitle(form.category)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {form.ministry}
                        </p>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))
                ) : (
                  <div className="py-8 sm:py-10 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">No forms found matching "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs sm:text-sm text-gray-400 hover:text-gray-600"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-all duration-200"
              >
                ← Back to categories
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
