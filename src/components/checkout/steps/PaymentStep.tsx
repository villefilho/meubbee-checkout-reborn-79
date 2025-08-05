import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CreditCard, QrCode, FileText, Shield, Check, CheckCircle, AlertCircle } from 'lucide-react';
import { CardData } from '@/types/checkout';
import { formatCardNumber, formatExpirationDate, onlyNumbers, formatCurrency } from '@/utils/formatters';

interface PaymentStepProps {
  checkout: {
    data: { 
      card?: CardData; 
      paymentMethod?: 'credit_card' | 'pix' | 'boleto';
      amount?: number;
      description?: string;
    };
    errors: { [key: string]: string };
    isLoading: boolean;
    updateCardData: (data: CardData) => void;
    updatePaymentMethod: (method: 'credit_card' | 'pix' | 'boleto') => void;
    updateField: (field: string, value: string, step: number) => void;
    prevStep: () => void;
    processPayment: () => Promise<any>;
  };
}

export const PaymentStep = ({ checkout }: PaymentStepProps) => {
  const [cardData, setCardData] = useState<CardData>({
    holderName: checkout.data.card?.holderName || '',
    number: checkout.data.card?.number || '',
    expirationMonth: checkout.data.card?.expirationMonth || '',
    expirationYear: checkout.data.card?.expirationYear || '',
    cvv: checkout.data.card?.cvv || '',
  });

  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleCardInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expirationMonth' || field === 'expirationYear') {
      formattedValue = onlyNumbers(value);
    } else if (field === 'cvv') {
      formattedValue = onlyNumbers(value);
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    checkout.updateField(field, formattedValue, 3);
  };

  const handleBlur = (field: keyof CardData) => {
    setTouchedFields(prev => new Set([...prev, field]));
  };

  const getFieldStatus = (field: keyof CardData) => {
    const isTouched = touchedFields.has(field);
    const hasError = checkout.errors[field];
    const hasValue = cardData[field] && cardData[field].trim() !== '';
    
    if (!isTouched) return 'default';
    if (hasError) return 'error';
    if (hasValue) return 'success';
    return 'default';
  };

  const getStatusIcon = (field: keyof CardData) => {
    const status = getFieldStatus(field);
    
    if (status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const handlePaymentMethodChange = (method: 'credit_card' | 'pix' | 'boleto') => {
    checkout.updatePaymentMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkout.data.paymentMethod === 'credit_card') {
      checkout.updateCardData(cardData);
    }
    
    const result = await checkout.processPayment();
    if (result) {
      setPaymentResult(result);
      setPaymentProcessed(true);
    }
  };

  const generateMockPIXData = () => ({
    qrCode: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-42665544000052040000',
    qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  });

  const generateMockBoletoData = () => ({
    boletoUrl: 'https://example.com/boleto.pdf',
    boletoBarcode: '23793381286008301027281040003127250000010000',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
  });

  if (paymentProcessed && paymentResult) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-soft rounded-full mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Pagamento Processado!
          </h2>
          <p className="text-muted-foreground">
            Seu pedido foi finalizado com sucesso
          </p>
        </div>

        <Card className="p-6 bg-secondary/50 border-secondary text-center">
          <p className="text-lg font-medium mb-2">Número da transação:</p>
          <p className="text-2xl font-bold text-primary">{paymentResult.transactionId}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Você receberá um e-mail com todos os detalhes da compra.
          </p>
        </Card>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = [
    { value: '01', label: '01 - Janeiro' },
    { value: '02', label: '02 - Fevereiro' },
    { value: '03', label: '03 - Março' },
    { value: '04', label: '04 - Abril' },
    { value: '05', label: '05 - Maio' },
    { value: '06', label: '06 - Junho' },
    { value: '07', label: '07 - Julho' },
    { value: '08', label: '08 - Agosto' },
    { value: '09', label: '09 - Setembro' },
    { value: '10', label: '10 - Outubro' },
    { value: '11', label: '11 - Novembro' },
    { value: '12', label: '12 - Dezembro' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Forma de Pagamento
        </h2>
        <p className="text-muted-foreground">
          Escolha como prefere realizar o pagamento
        </p>
      </div>

      {/* Order Summary */}
      <Card className="p-4 bg-gradient-soft border-0">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-foreground">{checkout.data.description}</p>
            <p className="text-sm text-muted-foreground">Valor do pedido</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(checkout.data.amount || 0)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-secondary/50 border-secondary">
        <Tabs 
          value={checkout.data.paymentMethod || 'credit_card'} 
          onValueChange={handlePaymentMethodChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="credit_card" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Cartão</span>
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="boleto" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Boleto</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credit_card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="holderName" className="text-sm font-medium">
                    Nome no Cartão *
                  </Label>
                  <div className="relative">
                    <Input
                      id="holderName"
                      type="text"
                      value={cardData.holderName}
                      onChange={(e) => handleCardInputChange('holderName', e.target.value)}
                      onBlur={() => handleBlur('holderName')}
                      placeholder="NOME COMO IMPRESSO NO CARTÃO"
                      className={`transition-all duration-300 pr-10 ${
                        getFieldStatus('holderName') === 'error' ? 'border-destructive focus:border-destructive' : 
                        getFieldStatus('holderName') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getStatusIcon('holderName')}
                    </div>
                  </div>
                  {checkout.errors.holderName && touchedFields.has('holderName') && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {checkout.errors.holderName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number" className="text-sm font-medium">
                    Número do Cartão *
                  </Label>
                  <div className="relative">
                    <Input
                      id="number"
                      type="text"
                      value={cardData.number}
                      onChange={(e) => handleCardInputChange('number', e.target.value)}
                      onBlur={() => handleBlur('number')}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className={`transition-all duration-300 pr-10 ${
                        getFieldStatus('number') === 'error' ? 'border-destructive focus:border-destructive' : 
                        getFieldStatus('number') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getStatusIcon('number')}
                    </div>
                  </div>
                  {checkout.errors.number && touchedFields.has('number') && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {checkout.errors.number}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expirationMonth" className="text-sm font-medium">
                      Mês *
                    </Label>
                    <div className="relative">
                      <Select
                        value={cardData.expirationMonth}
                        onValueChange={(value) => {
                          handleCardInputChange('expirationMonth', value);
                          handleBlur('expirationMonth');
                        }}
                      >
                        <SelectTrigger className={`transition-all duration-300 pr-10 ${
                          getFieldStatus('expirationMonth') === 'error' ? 'border-destructive focus:border-destructive' : 
                          getFieldStatus('expirationMonth') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                        }`}>
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getStatusIcon('expirationMonth')}
                      </div>
                    </div>
                    {checkout.errors.expirationMonth && touchedFields.has('expirationMonth') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {checkout.errors.expirationMonth}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expirationYear" className="text-sm font-medium">
                      Ano *
                    </Label>
                    <div className="relative">
                      <Select
                        value={cardData.expirationYear}
                        onValueChange={(value) => {
                          handleCardInputChange('expirationYear', value);
                          handleBlur('expirationYear');
                        }}
                      >
                        <SelectTrigger className={`transition-all duration-300 pr-10 ${
                          getFieldStatus('expirationYear') === 'error' ? 'border-destructive focus:border-destructive' : 
                          getFieldStatus('expirationYear') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                        }`}>
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getStatusIcon('expirationYear')}
                      </div>
                    </div>
                    {checkout.errors.expirationYear && touchedFields.has('expirationYear') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {checkout.errors.expirationYear}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-sm font-medium">
                      CVV *
                    </Label>
                    <div className="relative">
                      <Input
                        id="cvv"
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        onBlur={() => handleBlur('cvv')}
                        placeholder="000"
                        maxLength={4}
                        className={`transition-all duration-300 pr-10 ${
                          getFieldStatus('cvv') === 'error' ? 'border-destructive focus:border-destructive' : 
                          getFieldStatus('cvv') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                        }`}
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getStatusIcon('cvv')}
                      </div>
                    </div>
                    {checkout.errors.cvv && touchedFields.has('cvv') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {checkout.errors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-soft/20 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Seus dados estão protegidos por criptografia SSL
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={checkout.prevStep}
                  className="flex-1"
                  disabled={checkout.isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  variant="gradient"
                  className="flex-1"
                  disabled={checkout.isLoading}
                >
                  {checkout.isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Finalizar Compra
                      <CreditCard className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="pix">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-full mb-4">
                  <QrCode className="w-12 h-12 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Pagamento via PIX</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clique em "Gerar PIX" para criar seu código de pagamento
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={checkout.prevStep}
                  className="flex-1"
                  disabled={checkout.isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="gradient"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={checkout.isLoading}
                >
                  {checkout.isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      Gerar PIX
                      <QrCode className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="boleto">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-full mb-4">
                  <FileText className="w-12 h-12 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Pagamento via Boleto</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O boleto será gerado e você poderá imprimi-lo ou copiá-lo para pagar
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ O boleto vence em 3 dias úteis
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={checkout.prevStep}
                  className="flex-1"
                  disabled={checkout.isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="gradient"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={checkout.isLoading}
                >
                  {checkout.isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando Boleto...
                    </>
                  ) : (
                    <>
                      Gerar Boleto
                      <FileText className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};