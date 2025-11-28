import React from 'react';

interface VaultTimelineProps {
  currentStep: number; // 1-indexed (1, 2, 3...)
  totalSteps: number;
  className?: string;
}

/**
 * Composant Timeline pour afficher la progression dans le processus de dépôt/retrait
 */
export const VaultTimeline: React.FC<VaultTimelineProps> = ({
  currentStep,
  totalSteps,
  className = ''
}) => {
  return (
    <div className={`VaultTimeline ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <div
              className={`VaultTimeline__Step ${isCompleted ? 'VaultTimeline__Step--completed' : ''
                } ${isActive ? 'VaultTimeline__Step--active' : ''} ${isPending ? 'VaultTimeline__Step--pending' : ''
                }`}
            >
              <div className="VaultTimeline__StepNumber">
                {isCompleted ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3334 4L6.00002 11.3333L2.66669 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
            </div>
            {stepNumber < totalSteps && (
              <div
                className={`VaultTimeline__Line ${isCompleted ? 'VaultTimeline__Line--completed' : ''
                  }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

