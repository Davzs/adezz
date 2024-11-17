import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Loading..." }) => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-background/80 dark:bg-background/80 backdrop-blur-[2px] z-[9999] transition-opacity duration-200"
      role="alert"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3 p-4 rounded-lg">
        {/* Optimized dual-ring spinner */}
        <div className="relative w-16 h-16">
          {/* Outer ring with gradient */}
          <div className="absolute inset-0">
            <div className="w-full h-full rounded-full border-[3px] border-primary/20 dark:border-primary/10 border-t-primary animate-[spin_0.8s_linear_infinite] will-change-transform"></div>
          </div>
          
          {/* Inner ring with reverse animation */}
          <div className="absolute inset-[4px]">
            <div className="w-full h-full rounded-full border-[3px] border-primary/10 dark:border-primary/5 border-t-primary/40 animate-[spin_1.2s_linear_infinite_reverse] will-change-transform"></div>
          </div>
          
          {/* Center dot */}
          <div className="absolute inset-[45%] rounded-full bg-primary/40 dark:bg-primary/20 animate-pulse"></div>
        </div>
        
        {/* Loading text with optimized animation */}
        <div className="text-foreground/80 dark:text-foreground/80 font-medium text-sm animate-[pulse_2s_ease-in-out_infinite] will-change-opacity select-none">
          {text}
        </div>
      </div>
    </div>
  );
};

export { LoadingSpinner };
