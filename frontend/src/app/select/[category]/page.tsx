'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { listPDFForms } from '@/lib/api';
import { SAMPLE_PDF_FORMS } from '@/data/sampleForms';
import { PDFFormMeta, FormCategory } from '@/types/pdf';

// Category titles
const categoryTitles: Record<string, string> = {
  legal: 'Legal Forms',
  finance: 'Finance & Tax Forms',
};

// Map form IDs to their PDF URLs (for sample forms)
const formPdfUrls: Record<string, string> = {
  'basic-nda': 'http://localhost:5001/forms/Legal/Basic-Non-Disclosure-Agreement.pdf',
  'cra-td1': 'http://localhost:5001/forms/Finance/td1-fill-26e.pdf',
};

export default function CategoryFormsPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedForms, setUploadedForms] = useState<PDFFormMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch uploaded forms from API
  const fetchUploadedForms = useCallback(async () => {
    try {
      const response = await listPDFForms({ category });
      const apiForms: PDFFormMeta[] = response.forms.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        category: f.category as FormCategory,
        pdfUrl: f.pdfUrl,
        estimatedTime: f.estimatedTime,
        difficulty: f.difficulty,
        tags: f.tags,
        pageCount: f.pageCount,
        isXFA: f.isXFA,
      }));
      setUploadedForms(apiForms);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchUploadedForms();
  }, [fetchUploadedForms]);

  // Get sample forms for this category
  const sampleForms = SAMPLE_PDF_FORMS.filter(f => f.category === category);

  // Combine sample forms with uploaded forms (avoid duplicates)
  const allForms = [
    ...sampleForms,
    ...uploadedForms.filter(uf => !sampleForms.some(sf => sf.id === uf.id))
  ];

  // Filter by search query
  const filteredForms = searchQuery
    ? allForms.filter(form =>
        form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allForms;

  const handleFormSelect = (form: PDFFormMeta) => {
    // Store form data in sessionStorage
    sessionStorage.setItem('selectedFormId', form.id);
    sessionStorage.setItem('selectedFormName', form.name);
    sessionStorage.setItem('selectedFormCode', form.id.toUpperCase());

    // Get PDF URL - either from form object or from hardcoded map
    const pdfUrl = form.pdfUrl || formPdfUrls[form.id];
    if (pdfUrl) {
      sessionStorage.setItem('selectedFormPdfUrl', pdfUrl);
    }

    router.push('/formview');
  };

  const categoryTitle = categoryTitles[category] || `${category} Forms`;

  // Validate category
  if (!['legal', 'finance'].includes(category)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h1>
          <button
            onClick={() => router.push('/select')}
            className="text-gray-500 hover:text-gray-900"
          >
            ← Back to categories
          </button>
        </div>
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">
              {categoryTitle}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Select a form to get started
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 text-gray-900 border-2 border-gray-200 focus:border-gray-400 outline-none rounded-xl transition-all duration-200 placeholder:text-gray-400"
            />
          </div>

          {/* Forms List */}
          <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 text-sm mt-3">Loading forms...</p>
              </div>
            ) : filteredForms.length > 0 ? (
              filteredForms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => handleFormSelect(form)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-gray-900 text-white font-mono text-xs font-semibold flex-shrink-0">
                      {form.id.toUpperCase().slice(0, 6)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base text-gray-900 mb-1">
                        {form.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {form.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">
                          {form.estimatedTime}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          form.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          form.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {form.difficulty}
                        </span>
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0 mt-1">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">
                  {searchQuery ? `No forms found matching "${searchQuery}"` : 'No forms available in this category'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-sm text-gray-400 hover:text-gray-600"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => router.push('/select')}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-all duration-200"
            >
              ← Back to categories
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-[10px] text-gray-400">
          © 2026 Hackville FormBridge
        </div>
      </div>
    </div>
  );
}
