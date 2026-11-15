import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-[#FFF9F5] border border-[#E7C7CC] rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-[#F8EFEA] text-[#6D1836] flex items-center justify-center mb-4">
        {icon ?? (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path
              d="M6 21C9 15 13 10 22 6C19 14 14 19 6 21Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M6 21L4.5 23.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <h3 className="font-display text-xl font-medium text-[#3E2F27]">{title}</h3>
      <p className="text-sm text-[#7A655C] max-w-md mt-2 leading-relaxed">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium transition-colors whitespace-nowrap"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium transition-colors whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
