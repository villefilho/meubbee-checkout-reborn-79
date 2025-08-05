import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, MapPin, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { AddressData } from '@/types/checkout';
import { formatCEP, onlyNumbers } from '@/utils/formatters';

interface AddressStepProps {
  checkout: {
    data: { address?: AddressData };
    errors: { [key: string]: string };
    updateAddressData: (data: AddressData) => void;
    updateField: (field: string, value: string, step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
  };
}

const brazilianStates = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

export const AddressStep = ({ checkout }: AddressStepProps) => {
  const [formData, setFormData] = useState<AddressData>({
    country: checkout.data.address?.country || 'BR',
    state: checkout.data.address?.state || '',
    city: checkout.data.address?.city || '',
    neighborhood: checkout.data.address?.neighborhood || '',
    street: checkout.data.address?.street || '',
    streetNumber: checkout.data.address?.streetNumber || '',
    zipcode: checkout.data.address?.zipcode || '',
    complement: checkout.data.address?.complement || '',
  });

  const [loadingCEP, setLoadingCEP] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleInputChange = (field: keyof AddressData, value: string) => {
    let formattedValue = value;
    
    if (field === 'zipcode') {
      formattedValue = formatCEP(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    checkout.updateField(field, formattedValue, 2);
  };

  const handleBlur = (field: keyof AddressData) => {
    setTouchedFields(prev => new Set([...prev, field]));
  };

  const getFieldStatus = (field: keyof AddressData) => {
    const isTouched = touchedFields.has(field);
    const hasError = checkout.errors[field];
    const hasValue = formData[field] && formData[field].trim() !== '';
    
    if (!isTouched) return 'default';
    if (hasError) return 'error';
    if (hasValue) return 'success';
    return 'default';
  };

  const getStatusIcon = (field: keyof AddressData) => {
    const status = getFieldStatus(field);
    
    if (status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const searchCEP = async (cep: string) => {
    const cleanCEP = onlyNumbers(cep);
    if (cleanCEP.length !== 8) return;

    setLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        const updatedData = {
          ...formData,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        };
        
        setFormData(updatedData);
        
        // Update all fields in checkout
        checkout.updateField('street', updatedData.street, 2);
        checkout.updateField('neighborhood', updatedData.neighborhood, 2);
        checkout.updateField('city', updatedData.city, 2);
        checkout.updateField('state', updatedData.state, 2);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleCEPBlur = () => {
    handleBlur('zipcode');
    if (formData.zipcode) {
      searchCEP(formData.zipcode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkout.updateAddressData(formData);
    checkout.nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <MapPin className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Endereço de Entrega
        </h2>
        <p className="text-muted-foreground">
          Informe onde você gostaria de receber seu pedido
        </p>
      </div>

      <Card className="p-6 bg-secondary/50 border-secondary">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipcode" className="text-sm font-medium">
                CEP *
              </Label>
              <div className="relative">
                <Input
                  id="zipcode"
                  type="text"
                  value={formData.zipcode}
                  onChange={(e) => handleInputChange('zipcode', e.target.value)}
                  onBlur={handleCEPBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`pr-10 transition-all duration-300 ${
                    getFieldStatus('zipcode') === 'error' ? 'border-destructive focus:border-destructive' : 
                    getFieldStatus('zipcode') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                  required
                />
                {loadingCEP ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon('zipcode') || <Search className="w-4 h-4 text-muted-foreground" />}
                  </div>
                )}
              </div>
              {checkout.errors.zipcode && touchedFields.has('zipcode') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {checkout.errors.zipcode}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street" className="text-sm font-medium">
                  Logradouro *
                </Label>
                <div className="relative">
                  <Input
                    id="street"
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    onBlur={() => handleBlur('street')}
                    placeholder="Rua, Avenida, etc."
                    className={`transition-all duration-300 pr-10 ${
                      getFieldStatus('street') === 'error' ? 'border-destructive focus:border-destructive' : 
                      getFieldStatus('street') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon('street')}
                  </div>
                </div>
                {checkout.errors.street && touchedFields.has('street') && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {checkout.errors.street}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetNumber" className="text-sm font-medium">
                  Número *
                </Label>
                <div className="relative">
                  <Input
                    id="streetNumber"
                    type="text"
                    value={formData.streetNumber}
                    onChange={(e) => handleInputChange('streetNumber', e.target.value)}
                    onBlur={() => handleBlur('streetNumber')}
                    placeholder="123"
                    className={`transition-all duration-300 pr-10 ${
                      getFieldStatus('streetNumber') === 'error' ? 'border-destructive focus:border-destructive' : 
                      getFieldStatus('streetNumber') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon('streetNumber')}
                  </div>
                </div>
                {checkout.errors.streetNumber && touchedFields.has('streetNumber') && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {checkout.errors.streetNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement" className="text-sm font-medium">
                Complemento
              </Label>
              <Input
                id="complement"
                type="text"
                value={formData.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                placeholder="Apartamento, Bloco, etc. (opcional)"
                className="transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-sm font-medium">
                Bairro *
              </Label>
              <div className="relative">
                <Input
                  id="neighborhood"
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  onBlur={() => handleBlur('neighborhood')}
                  placeholder="Seu bairro"
                  className={`transition-all duration-300 pr-10 ${
                    getFieldStatus('neighborhood') === 'error' ? 'border-destructive focus:border-destructive' : 
                    getFieldStatus('neighborhood') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon('neighborhood')}
                </div>
              </div>
              {checkout.errors.neighborhood && touchedFields.has('neighborhood') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {checkout.errors.neighborhood}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Cidade *
                </Label>
                <div className="relative">
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onBlur={() => handleBlur('city')}
                    placeholder="Sua cidade"
                    className={`transition-all duration-300 pr-10 ${
                      getFieldStatus('city') === 'error' ? 'border-destructive focus:border-destructive' : 
                      getFieldStatus('city') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon('city')}
                  </div>
                </div>
                {checkout.errors.city && touchedFields.has('city') && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {checkout.errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  Estado *
                </Label>
                <div className="relative">
                  <Select
                    value={formData.state}
                    onValueChange={(value) => {
                      handleInputChange('state', value);
                      handleBlur('state');
                    }}
                  >
                    <SelectTrigger className={`transition-all duration-300 pr-10 ${
                      getFieldStatus('state') === 'error' ? 'border-destructive focus:border-destructive' : 
                      getFieldStatus('state') === 'success' ? 'border-green-500 focus:border-green-500' : ''
                    }`}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon('state')}
                  </div>
                </div>
                {checkout.errors.state && touchedFields.has('state') && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {checkout.errors.state}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={checkout.prevStep}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="submit"
              size="lg"
              variant="gradient"
              className="flex-1"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};