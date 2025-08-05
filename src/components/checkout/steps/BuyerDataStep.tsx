import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowRight, User, CheckCircle, AlertCircle } from 'lucide-react';
import { BuyerData } from '@/types/checkout';
import { formatCPF, formatPhone } from '@/utils/formatters';

interface BuyerDataStepProps {
  checkout: {
    data: { buyer?: BuyerData };
    errors: { [key: string]: string };
    updateBuyerData: (data: BuyerData) => void;
    updateField: (field: string, value: string, step: number) => void;
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

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleInputChange = (field: keyof BuyerData, value: string) => {
    let formattedValue = value;
    
    if (field === 'document') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    checkout.updateField(field, formattedValue, 1);
  };

  const handleBlur = (field: keyof BuyerData) => {
    setTouchedFields(prev => new Set([...prev, field]));
  };

  const getFieldStatus = (field: keyof BuyerData) => {
    const isTouched = touchedFields.has(field);
    const hasError = checkout.errors[field];
    const hasValue = formData[field] && formData[field].trim() !== '';
    
    if (!isTouched) return 'default';
    if (hasError) return 'error';
    if (hasValue) return 'success';
    return 'default';
  };

  const getStatusIcon = (field: keyof BuyerData) => {
    const status = getFieldStatus(field);
    
    if (status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    checkout.updateBuyerData(formData);
    console.log('Calling nextStep');
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
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Digite seu nome completo"
                  className={`transition-all duration-300 pr-10 ${
                    getFieldStatus('name') === 'error' ? 'border-destructive focus:border-destructive' : 
                    getFieldStatus('name') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon('name')}
                </div>
              </div>
              {checkout.errors.name && touchedFields.has('name') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {checkout.errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="seu@email.com"
                  className={`transition-all duration-300 pr-10 ${
                    getFieldStatus('email') === 'error' ? 'border-destructive focus:border-destructive' : 
                    getFieldStatus('email') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon('email')}
                </div>
              </div>
              {checkout.errors.email && touchedFields.has('email') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {checkout.errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document" className="text-sm font-medium">
                CPF *
              </Label>
              <div className="relative">
                <Input
                  id="document"
                  type="text"
                  name="document"
                  value={formData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  onBlur={() => handleBlur('document')}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`transition-all duration-300 pr-10 ${
                    getFieldStatus('document') === 'error' ? 'border-destructive focus:border-destructive' : 
                    getFieldStatus('document') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon('document')}
                </div>
              </div>
              {checkout.errors.document && touchedFields.has('document') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {checkout.errors.document}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefone *
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className={`transition-all duration-300 pr-10 ${
                    getFieldStatus('phone') === 'error' ? 'border-destructive focus:border-destructive' : 
                    getFieldStatus('phone') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon('phone')}
                </div>
              </div>
              {checkout.errors.phone && touchedFields.has('phone') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {checkout.errors.phone}
                </p>
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