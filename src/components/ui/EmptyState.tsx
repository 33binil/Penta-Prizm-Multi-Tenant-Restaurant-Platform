import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 mb-3">
          <Icon className="w-5 h-5 stroke-[1.5]" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h4>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
