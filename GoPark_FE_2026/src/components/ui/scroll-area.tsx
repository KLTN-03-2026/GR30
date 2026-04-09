"use client";

import React from "react";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// Minimal, safe ScrollArea wrapper to avoid missing import errors.
// Uses native scrolling; can be replaced with Radix ScrollArea later.
export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className = "", ...props }) => {
  return (
    <div
      {...props}
      className={["overflow-auto", "touch-auto", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
};

export default ScrollArea;
