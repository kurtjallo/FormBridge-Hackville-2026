"use client";

import { HelpCircle, FileQuestion, UserCheck } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  const { t } = useTranslation();

  const quickActions = [
    {
      label: t('chat.quickActions.meaningLabel'),
      message: t('chat.quickActions.meaningMessage'),
      icon: HelpCircle,
    },
    {
      label: t('chat.quickActions.exampleLabel'),
      message: t('chat.quickActions.exampleMessage'),
      icon: FileQuestion,
    },
    {
      label: t('chat.quickActions.applyLabel'),
      message: t('chat.quickActions.applyMessage'),
      icon: UserCheck,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <action.icon className="w-3.5 h-3.5" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
