import { Check, User, MapPin, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckoutStep } from '@/types/checkout';

interface CheckoutProgressBarProps {
  currentStep: CheckoutStep;
}

export const CheckoutProgressBar = ({ currentStep }: CheckoutProgressBarProps) => {
  const steps = [
    { number: 1, label: 'Dados Pessoais', icon: User },
    { number: 2, label: 'Endereço', icon: MapPin },
    { number: 3, label: 'Pagamento', icon: CreditCard },
  ];

  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-border">
        <div 
          className="h-full bg-gradient-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                  {
                    'bg-gradient-primary border-primary text-primary-foreground shadow-button': isCompleted,
                    'bg-background border-primary text-primary shadow-soft scale-110': isCurrent,
                    'bg-background border-border text-muted-foreground': !isCompleted && !isCurrent,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              
              <span
                className={cn(
                  'mt-2 text-xs font-medium transition-colors duration-300 text-center max-w-20',
                  {
                    'text-primary': isCompleted || isCurrent,
                    'text-muted-foreground': !isCompleted && !isCurrent,
                  }
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};