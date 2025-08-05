import { Card } from '@/components/ui/card';
import { CheckoutHeader } from './CheckoutHeader';
import { CheckoutProgressBar } from './CheckoutProgressBar';
import { CartSummary } from './CartSummary';
import { BuyerDataStep } from './steps/BuyerDataStep';
import { AddressStep } from './steps/AddressStep';
import { PaymentStep } from './steps/PaymentStep';
import { useCheckout } from '@/hooks/useCheckout';

export const CheckoutContainer = () => {
  const checkout = useCheckout();

  const renderCurrentStep = () => {
    switch (checkout.currentStep) {
      case 1:
        return <BuyerDataStep checkout={checkout} />;
      case 2:
        return <AddressStep checkout={checkout} />;
      case 3:
        return <PaymentStep checkout={checkout} />;
      default:
        return <BuyerDataStep checkout={checkout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <CheckoutHeader />
        
        <Card className="mt-8 overflow-hidden shadow-card border-0 bg-background/95 backdrop-blur">
          <div className="p-6 md:p-8">
            <CartSummary items={checkout.data.items || []} total={checkout.data.amount || 0} />
            <CheckoutProgressBar currentStep={checkout.currentStep} />
            
            <div className="mt-8">
              {renderCurrentStep()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};