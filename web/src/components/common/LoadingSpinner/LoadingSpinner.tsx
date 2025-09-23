import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large" | "sm" | "lg";
}

export function LoadingSpinner({ size = "medium" }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    sm: "w-4 h-4", // alias for small
    medium: "w-8 h-8",
    large: "w-12 h-12",
    lg: "w-12 h-12", // alias for large
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}
