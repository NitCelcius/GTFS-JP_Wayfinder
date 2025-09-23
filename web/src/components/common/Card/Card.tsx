import React from "react";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
  const baseClasses = [
    "w-full",
    "bg-white",
    "border",
    "border-gray-200",
    "rounded-[var(--radius-lg)]",
    "p-[var(--size-spacing-lg)]",
    "mb-[var(--size-spacing-md)]",
    "transition-all",
    "duration-200",
  ];

  const interactiveClasses = onClick
    ? [
        "cursor-pointer",
        "hover:shadow-md",
        "hover:border-gray-300",
        "active:scale-[0.98]",
      ]
    : [];

  const allClasses = [...baseClasses, ...interactiveClasses, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={allClasses} onClick={onClick}>
      {children}
    </div>
  );
}
