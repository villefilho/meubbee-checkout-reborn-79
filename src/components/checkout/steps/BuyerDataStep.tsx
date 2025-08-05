import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowRight, User } from 'lucide-react';
import { BuyerData } from '@/types/checkout';
import { formatCPF, formatPhone, onlyNumbers, validateCPF } from '@/utils/formatters';

interface BuyerDataStepProps {
  checkout: {
    data: { buyer?: BuyerData };
    errors: { [key: string]: string };
    updateBuyerData: (data: BuyerData) => void;
    nextStep: () => void;
  };
}

export const BuyerDataStep = ({ checkout }: BuyerDataStepProps) => {
  const [formData, setFormData] = useState<BuyerData>({
    name: checkout.data.buyer?.name || '',
    email: checkout.data.buyer?.email || '',
    document: checkout.data.buyer?.document || '',
    phone: checkout.data.buyer?.phone || '',
  });

  const handleInputChange = (field: keyof BuyerData, value: string) => {
    let formattedValue = value;
    
    if (field === 'document') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkout.updateBuyerData(formData);
    checkout.nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <User className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Dados Pessoais
        </h2>
        <p className="text-muted-foreground">
          Precisamos dessas informações para processar sua compra
        </p>
      </div>

      <Card className="p-6 bg-secondary/50 border-secondary">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
                className={`transition-all duration-300 ${
                  checkout.errors.name ? 'border-destructive focus:border-destructive' : ''
                }`}
                required
              />
              {checkout.errors.name && (
                <p className="text-sm text-destructive">{checkout.errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={`transition-all duration-300 ${
                  checkout.errors.email ? 'border-destructive focus:border-destructive' : ''
                }`}
                required
              />
              {checkout.errors.email && (
                <p className="text-sm text-destructive">{checkout.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document" className="text-sm font-medium">
                CPF *
              </Label>
              <Input
                id="document"
                type="text"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className={`transition-all duration-300 ${
                  checkout.errors.document ? 'border-destructive focus:border-destructive' : ''
                }`}
                required
              />
              {checkout.errors.document && (
                <p className="text-sm text-destructive">{checkout.errors.document}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className={`transition-all duration-300 ${
                  checkout.errors.phone ? 'border-destructive focus:border-destructive' : ''
                }`}
                required
              />
              {checkout.errors.phone && (
                <p className="text-sm text-destructive">{checkout.errors.phone}</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            variant="gradient"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Card>
    </div>
  );
};