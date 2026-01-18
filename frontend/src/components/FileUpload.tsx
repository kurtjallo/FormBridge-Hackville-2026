'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { uploadPDFForm } from '@/lib/api';
import { FormCategory, FORM_CATEGORIES } from '@/types/pdf';

interface FileUploadProps {
    onUploadSuccess: (form: { id: string; name: string; pdfUrl: string }) => void;
    onCancel: () => void;
}

interface UploadFormData {
    name: string;
    description: string;
    category: FormCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
}

export function FileUpload({ onUploadSuccess, onCancel }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<UploadFormData>({
        name: '',
        description: '',
        category: 'legal',
        difficulty: 'medium',
        estimatedTime: '10-15 minutes',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (f: File) => {
        if (f.type !== 'application/pdf') {
            setError('Please select a PDF file');
            return;
        }
        if (f.size > 50 * 1024 * 1024) {
            setError('File size must be less than 50MB');
            return;
        }
        setFile(f);
        // Auto-fill name from filename if empty
        if (!formData.name) {
            const nameWithoutExt = f.name.replace(/\.pdf$/i, '');
            setFormData(prev => ({ ...prev, name: nameWithoutExt }));
        }
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }
        if (!formData.name.trim()) {
            setError('Please enter a form name');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // Convert file to base64
            const base64 = await fileToBase64(file);

            const result = await uploadPDFForm({
                pdfBase64: base64,
                name: formData.name.trim(),
                description: formData.description.trim(),
                category: formData.category,
                difficulty: formData.difficulty,
                estimatedTime: formData.estimatedTime,
            });

            onUploadSuccess(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const fileToBase64 = (f: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix to get pure base64
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(f);
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload PDF Form</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isUploading}
                >
                    Cancel
                </button>
            </div>

            {/* Drag and Drop Zone */}
            {!file ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                        transition-all duration-200 group
                        ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                        }
                    `}
                >
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-3xl">📄</span>
                    </div>
                    <p className="text-gray-900 font-medium mb-2">
                        Drag and drop your PDF here
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                        or click to browse
                    </p>
                    <p className="text-gray-400 text-xs">
                        Maximum file size: 50MB
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            ) : (
                /* File Selected - Show Form */
                <div className="space-y-4">
                    {/* File Preview */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-xl shadow-sm">
                            📄
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-medium truncate">{file.name}</p>
                            <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="text-gray-400 hover:text-red-500 px-2 transition-colors"
                            disabled={isUploading}
                        >
                            Remove
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                Form Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Ontario Works Application"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                disabled={isUploading}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief description of this form..."
                                rows={2}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                disabled={isUploading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                                        disabled={isUploading}
                                    >
                                        {FORM_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                    Difficulty
                                </label>
                                <div className="relative">
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                                        disabled={isUploading}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        ▼
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1.5">
                                Estimated Time
                            </label>
                            <input
                                type="text"
                                name="estimatedTime"
                                value={formData.estimatedTime}
                                onChange={handleInputChange}
                                placeholder="e.g., 10-15 minutes"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                disabled={isUploading}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    {error}
                </div>
            )}

            {/* Upload Button */}
            {file && (
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !formData.name.trim()}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <span>⬆️</span>
                                Upload Form
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
