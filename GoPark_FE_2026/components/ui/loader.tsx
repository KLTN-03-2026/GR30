import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  fullScreen?: boolean;
  text?: string;
}

export function Loader({ 
  size = 'md', 
  variant = 'spinner', 
  fullScreen = false, 
  text,
  className,
  ...props 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm' 
    : 'flex items-center justify-center w-full min-h-[50px]';

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        const dotSizeClasses = {
          sm: 'w-1.5 h-1.5',
          md: 'w-2.5 h-2.5',
          lg: 'w-3.5 h-3.5',
          xl: 'w-5 h-5'
        };
        return (
          <div className="flex gap-1.5 items-center justify-center">
            <div className={cn('bg-primary rounded-full animate-bounce [animation-delay:-0.3s]', dotSizeClasses[size])} />
            <div className={cn('bg-primary rounded-full animate-bounce [animation-delay:-0.15s]', dotSizeClasses[size])} />
            <div className={cn('bg-primary rounded-full animate-bounce', dotSizeClasses[size])} />
          </div>
        );

      case 'pulse':
        return (
          <div className={cn('bg-primary rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75', sizeClasses[size])} />
        );

      case 'spinner':
      default:
        return <Loader2 className={cn('text-primary animate-spin', sizeClasses[size])} />;
    }
  };

  return (
    <div className={cn(containerClasses, className)} {...props}>
      <div className={cn(fullScreen && "bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 min-w-[200px] border border-slate-100")}>
        {renderLoader()}
        {text && <p className="text-sm font-semibold text-slate-700 animate-pulse">{text}</p>}
      </div>
    </div>
  );
}

export default Loader;
