import { HelpCircle, FileQuestion, UserCheck } from 'lucide-react';

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const QUICK_ACTIONS = [
  {
    label: 'What does this mean?',
    message: 'Can you explain what this question is asking in simple terms?',
    icon: HelpCircle,
  },
  {
    label: 'Give me an example',
    message: 'Can you give me an example of how to answer this question?',
    icon: FileQuestion,
  },
  {
    label: 'Does my situation apply?',
    message: 'How do I know if this question applies to my situation?',
    icon: UserCheck,
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_ACTIONS.map((action) => (
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
