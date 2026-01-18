'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/FileUpload';

interface CategoryOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const categoryOptions: CategoryOption[] = [
  {
    id: 'legal',
    title: 'Legal',
    description: 'Non-disclosure agreements, contracts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'finance',
    title: 'Finance & Tax',
    description: 'CRA tax forms, T1 returns',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export default function SelectCategoryPage() {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/select/${categoryId}`);
  };

  const handleUploadSuccess = (result: { id: string; name: string; pdfUrl: string }) => {
    setShowUpload(false);
    // Store the uploaded form info and navigate to formview
    sessionStorage.setItem('selectedFormId', result.id);
    sessionStorage.setItem('selectedFormName', result.name);
    sessionStorage.setItem('selectedFormPdfUrl', result.pdfUrl);
    router.push('/formview');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 selection:text-black overflow-hidden">
      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Swiss Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#cfd1d4 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">
            Select a category
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8">
            Which category best fits your form?
          </p>

          {/* Category Cards */}
          <div className="space-y-3 mb-8">
            {categoryOptions.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-center gap-4"
              >
                <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700">
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base text-gray-900">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUpload(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-center justify-center gap-3 text-gray-600 hover:text-gray-900"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="font-medium">Upload Your Own PDF</span>
          </button>

          {/* Back Link */}
          <button
            onClick={() => router.push('/')}
            className="mt-8 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-all duration-200"
          >
            ← Back to home
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-[10px] text-gray-400">
          © 2026 Hackville FormBridge
        </div>
      </div>
    </div>
  );
}
