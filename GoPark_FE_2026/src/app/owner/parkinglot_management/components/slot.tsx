"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const Slot = ({ slot, onClick, orientation = "top", size = "normal" }: any) => {
  const { status, label, ticket } = slot;
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (status !== "occupied" || !ticket) {
      setProgress(0);
      return;
    }
    const updateProgress = () => {
      const now = new Date().getTime();
      const start = ticket.startTime.getTime();
      const end = ticket.endTime.getTime();
      let p = ((now - start) / (end - start)) * 100;
      setProgress(Math.min(Math.max(p, 0), 100));
    };
    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [status, ticket]);

  const getBackgroundStyle = () => {
    if (status === "occupied") {
      return { background: `linear-gradient(to top, #3b82f6 ${progress}%, #93c5fd ${progress}%)` };
    }
    return {};
  };

  const getStatusClasses = () => {
    switch (status) {
      case "occupied": return "border-blue-600 bg-blue-100 text-blue-900";
      case "reserved": return "border-orange-500 bg-orange-500 text-white shadow-md";
      case "available": default: return "border-dashed border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-700";
    }
  };

  const sizeClasses = size === "small" ? "w-12 h-20 text-[11px] border-[2px]" : "w-16 h-[106px] text-base border-[2px]";
  const isTop = orientation === "top";

  return (
    <div
      onClick={onClick}
      style={getBackgroundStyle()}
      className={cn(
        "relative flex flex-col items-center justify-center transition-all duration-300 shadow-sm cursor-pointer overflow-hidden flex-shrink-0 rounded-md group",
        sizeClasses,
        getStatusClasses()
      )}
    >
       <span className={cn(
         "font-bold transition-opacity z-10", 
         status === "occupied" ? "text-white drop-shadow-md" : "",
         isTop ? "rotate-180 mb-1" : "mt-1",
         size === "small" ? "text-[11px]" : "text-base"
       )}>
         {label}
       </span>

       {status === "reserved" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 rounded-full p-1 backdrop-blur-sm">
          <Check className={size === "small" ? "w-3 h-3" : "w-4 h-4"} />
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
    </div>
  );
};
