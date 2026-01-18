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
        <div className="bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload PDF Form</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white"
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
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                        transition-colors duration-200
                        ${isDragging
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                        }
                    `}
                >
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-white font-medium mb-2">
                        Drag and drop your PDF here
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                        or click to browse
                    </p>
                    <p className="text-gray-500 text-xs">
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
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <span className="text-2xl">📄</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{file.name}</p>
                            <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="text-gray-400 hover:text-red-400 px-2"
                            disabled={isUploading}
                        >
                            Remove
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">
                                Form Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Ontario Works Application"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                disabled={isUploading}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief description of this form..."
                                rows={2}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                                disabled={isUploading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    disabled={isUploading}
                                >
                                    {FORM_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-1">
                                    Difficulty
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    disabled={isUploading}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">
                                Estimated Time
                            </label>
                            <input
                                type="text"
                                name="estimatedTime"
                                value={formData.estimatedTime}
                                onChange={handleInputChange}
                                placeholder="e.g., 10-15 minutes"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                disabled={isUploading}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Upload Button */}
            {file && (
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !formData.name.trim()}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
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
