import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, MapPin, Search } from 'lucide-react';
import { AddressData } from '@/types/checkout';
import { formatCEP, onlyNumbers } from '@/utils/formatters';

interface AddressStepProps {
  checkout: {
    data: { address?: AddressData };
    errors: { [key: string]: string };
    updateAddressData: (data: AddressData) => void;
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

  const handleInputChange = (field: keyof AddressData, value: string) => {
    let formattedValue = value;
    
    if (field === 'zipcode') {
      formattedValue = formatCEP(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const searchCEP = async (cep: string) => {
    const cleanCEP = onlyNumbers(cep);
    if (cleanCEP.length !== 8) return;

    setLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleCEPBlur = () => {
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
                    checkout.errors.zipcode ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  required
                />
                {loadingCEP ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
              </div>
              {checkout.errors.zipcode && (
                <p className="text-sm text-destructive">{checkout.errors.zipcode}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street" className="text-sm font-medium">
                  Logradouro *
                </Label>
                <Input
                  id="street"
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                  className={`transition-all duration-300 ${
                    checkout.errors.street ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  required
                />
                {checkout.errors.street && (
                  <p className="text-sm text-destructive">{checkout.errors.street}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetNumber" className="text-sm font-medium">
                  Número *
                </Label>
                <Input
                  id="streetNumber"
                  type="text"
                  value={formData.streetNumber}
                  onChange={(e) => handleInputChange('streetNumber', e.target.value)}
                  placeholder="123"
                  className={`transition-all duration-300 ${
                    checkout.errors.streetNumber ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  required
                />
                {checkout.errors.streetNumber && (
                  <p className="text-sm text-destructive">{checkout.errors.streetNumber}</p>
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
              <Input
                id="neighborhood"
                type="text"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="Seu bairro"
                className={`transition-all duration-300 ${
                  checkout.errors.neighborhood ? 'border-destructive focus:border-destructive' : ''
                }`}
                required
              />
              {checkout.errors.neighborhood && (
                <p className="text-sm text-destructive">{checkout.errors.neighborhood}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Cidade *
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Sua cidade"
                  className={`transition-all duration-300 ${
                    checkout.errors.city ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  required
                />
                {checkout.errors.city && (
                  <p className="text-sm text-destructive">{checkout.errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  Estado *
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange('state', value)}
                >
                  <SelectTrigger className={`transition-all duration-300 ${
                    checkout.errors.state ? 'border-destructive focus:border-destructive' : ''
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
                {checkout.errors.state && (
                  <p className="text-sm text-destructive">{checkout.errors.state}</p>
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