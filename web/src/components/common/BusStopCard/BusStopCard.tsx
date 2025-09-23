import React from "react";

import { Card } from "../Card";

interface BusStopCardProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  actionLabel: string;
  onClick?: () => void;
  onActionClick?: (e: React.MouseEvent) => void;
  secondaryInfo?: string; // for additional info like "searched at" time
}

export function BusStopCard({
  title,
  subtitle,
  icon,
  actionLabel,
  onClick,
  onActionClick,
  secondaryInfo,
}: BusStopCardProps) {
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick?.(e);
  };

  return (
    <Card onClick={onClick}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[var(--size-spacing-md)] flex-1">
          {icon && (
            <div className="w-[1.5rem] h-[1.5rem] flex items-center justify-center text-gray-600">
              {icon}
            </div>
          )}
          <div className="flex flex-col flex-1">
            <span className="text-[1.125rem] mb-[var(--size-spacing-xs)]">
              {title}
            </span>
            <div className="flex items-center gap-[var(--size-spacing-md)]">
              <span className="text-[1rem] text-gray-600">{subtitle}</span>
              {secondaryInfo && (
                <span className="text-[0.875rem] text-gray-500">
                  ・{secondaryInfo}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="bg-[var(--color-route-primary)] text-white px-[var(--size-spacing-lg)] py-[var(--size-spacing-sm)] rounded-[var(--radius-md)] hover:bg-[var(--color-route-primary-dark)] transition-colors duration-200 min-w-[4rem] text-center"
            onClick={handleActionClick}
          >
            <span className="text-[0.875rem]">{actionLabel}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
