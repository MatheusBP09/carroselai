interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
}

export const ProgressIndicator = ({ currentStep, totalSteps, stepLabels, onStepClick }: ProgressIndicatorProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-8 px-4">
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted/30 hidden sm:block" />
        
        {/* Progress Line Filled */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-success to-instagram-middle transition-all duration-500 ease-out hidden sm:block"
          style={{ 
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
          }}
        />

        {/* Steps Container */}
        <div className="grid gap-4 sm:gap-0" style={{ gridTemplateColumns: `repeat(${stepLabels.length}, 1fr)` }}>
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isFuture = stepNumber > currentStep;
            const isClickable = onStepClick && (isCompleted || isCurrent);
            
            return (
              <div key={index} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 ease-out transform border-2
                    ${isCompleted 
                      ? "bg-success border-success text-success-foreground shadow-lg shadow-success/20 scale-100" 
                      : isCurrent
                      ? "bg-gradient-to-r from-instagram-start to-instagram-middle border-instagram-middle text-white shadow-lg shadow-instagram/30 scale-110"
                      : "bg-background border-muted text-muted-foreground hover:border-muted-foreground/50"
                    }
                    ${isClickable ? "cursor-pointer hover:scale-105 active:scale-95" : ""}
                  `}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="font-bold">{stepNumber}</span>
                  )}
                </div>
              
                {/* Step Label */}
                <div className={`
                  mt-3 text-center transition-colors duration-200
                  ${isCurrent 
                    ? "text-foreground font-semibold" 
                    : isCompleted
                    ? "text-muted-foreground font-medium"
                    : "text-muted-foreground/70"
                  }
                `}>
                  <span className="text-xs sm:text-sm font-medium px-2 leading-tight block max-w-20 sm:max-w-24">
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Progress Bar */}
        <div className="mt-6 sm:hidden">
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-success to-instagram-middle h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Etapa {currentStep}</span>
            <span>{totalSteps} etapas</span>
          </div>
        </div>
      </div>
    </div>
  );
};