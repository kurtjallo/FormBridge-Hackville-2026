'use client';

import { MessageCircle, FileText } from 'lucide-react';

interface SidebarTabsProps {
    activeTab: 'chat' | 'fields';
    onTabChange: (tab: 'chat' | 'fields') => void;
    hasFields: boolean;
}

export function SidebarTabs({ activeTab, onTabChange, hasFields }: SidebarTabsProps) {
    return (
        <div className="flex border-b border-gray-200">
            <button
                onClick={() => onTabChange('chat')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                <MessageCircle className="w-4 h-4" />
                Chat
            </button>
            {hasFields && (
                <button
                    onClick={() => onTabChange('fields')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'fields'
                            ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    Fields
                </button>
            )}
        </div>
    );
}
