import { useState, useCallback, useEffect } from 'react';
import { CheckoutData, CheckoutStep, ValidationErrors, BuyerData, AddressData, CardData, CartItem } from '@/types/checkout';
import { 
  validateCPF, 
  validateEmail, 
  validatePhone, 
  validateCEP, 
  validateCardNumber, 
  validateCVV, 
  validateExpirationDate,
  validateName,
  validateStreet,
  validateStreetNumber,
  validateNeighborhood,
  validateCity,
  validateState
} from '@/utils/formatters';

const parseCartFromURL = (): CartItem[] => {
  const urlParams = new URLSearchParams(window.location.search);
  const items: CartItem[] = [];
  
  // Format: ?item=id,name,price,quantity&item=id2,name2,price2,quantity2
  const itemParams = urlParams.getAll('item');
  
  itemParams.forEach(itemString => {
    const [id, name, priceStr, quantityStr] = itemString.split(',');
    if (id && name && priceStr && quantityStr) {
      items.push({
        id,
        name,
        price: parseInt(priceStr, 10),
        quantity: parseInt(quantityStr, 10)
      });
    }
  });
  
  return items;
};

export const useCheckout = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [data, setData] = useState<Partial<CheckoutData>>({
    items: [],
    amount: 0,
    description: 'Carrinho de compras',
    paymentMethod: 'credit_card'
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load cart items from URL on mount
  useEffect(() => {
    const cartItems = parseCartFromURL();
    if (cartItems.length > 0) {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setData(prev => ({
        ...prev,
        items: cartItems,
        amount: totalAmount,
        description: `Carrinho com ${cartItems.length} item(s)`
      }));
    }
  }, []);

  const updateBuyerData = useCallback((buyerData: BuyerData) => {
    setData(prev => ({ ...prev, buyer: buyerData }));
    setErrors({});
  }, []);

  const updateAddressData = useCallback((addressData: AddressData) => {
    setData(prev => ({ ...prev, address: addressData }));
    setErrors({});
  }, []);

  const updateCardData = useCallback((cardData: CardData) => {
    setData(prev => ({ ...prev, card: cardData }));
    setErrors({});
  }, []);

  const updatePaymentMethod = useCallback((method: 'credit_card' | 'pix' | 'boleto') => {
    setData(prev => ({ ...prev, paymentMethod: method }));
  }, []);

  // Real-time field validation
  const validateField = useCallback((field: string, value: string, step: CheckoutStep): string | null => {
    switch (step) {
      case 1:
        switch (field) {
          case 'name':
            if (!value) return 'Nome é obrigatório';
            if (!validateName(value)) return 'Nome deve ter pelo menos 2 caracteres e conter apenas letras';
            return null;
          case 'email':
            if (!value) return 'Email é obrigatório';
            if (!validateEmail(value)) return 'Email inválido';
            return null;
          case 'document':
            if (!value) return 'CPF é obrigatório';
            if (!validateCPF(value)) return 'CPF inválido';
            return null;
          case 'phone':
            if (!value) return 'Telefone é obrigatório';
            if (!validatePhone(value)) return 'Telefone deve ter 10 ou 11 dígitos';
            return null;
          default:
            return null;
        }
      case 2:
        switch (field) {
          case 'zipcode':
            if (!value) return 'CEP é obrigatório';
            if (!validateCEP(value)) return 'CEP deve ter 8 dígitos';
            return null;
          case 'street':
            if (!value) return 'Logradouro é obrigatório';
            if (!validateStreet(value)) return 'Logradouro deve ter pelo menos 3 caracteres';
            return null;
          case 'streetNumber':
            if (!value) return 'Número é obrigatório';
            if (!validateStreetNumber(value)) return 'Número é obrigatório';
            return null;
          case 'neighborhood':
            if (!value) return 'Bairro é obrigatório';
            if (!validateNeighborhood(value)) return 'Bairro deve ter pelo menos 2 caracteres';
            return null;
          case 'city':
            if (!value) return 'Cidade é obrigatória';
            if (!validateCity(value)) return 'Cidade deve ter pelo menos 2 caracteres';
            return null;
          case 'state':
            if (!value) return 'Estado é obrigatório';
            if (!validateState(value)) return 'Estado é obrigatório';
            return null;
          default:
            return null;
        }
      case 3:
        if (data.paymentMethod === 'credit_card') {
          switch (field) {
            case 'holderName':
              if (!value) return 'Nome no cartão é obrigatório';
              if (!validateName(value)) return 'Nome deve ter pelo menos 2 caracteres';
              return null;
            case 'number':
              if (!value) return 'Número do cartão é obrigatório';
              if (!validateCardNumber(value)) return 'Número do cartão inválido';
              return null;
            case 'expirationMonth':
              if (!value) return 'Mês é obrigatório';
              return null;
            case 'expirationYear':
              if (!value) return 'Ano é obrigatório';
              return null;
            case 'cvv':
              if (!value) return 'CVV é obrigatório';
              if (!validateCVV(value)) return 'CVV deve ter 3 ou 4 dígitos';
              return null;
            default:
              return null;
          }
        }
        return null;
      default:
        return null;
    }
  }, [data.paymentMethod]);

  // Update field with real-time validation
  const updateField = useCallback((field: string, value: string, step: CheckoutStep) => {
    // Update the data
    if (step === 1) {
      setData(prev => ({
        ...prev,
        buyer: { ...prev.buyer, [field]: value }
      }));
    } else if (step === 2) {
      setData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (step === 3 && data.paymentMethod === 'credit_card') {
      setData(prev => ({
        ...prev,
        card: { ...prev.card, [field]: value }
      }));
    }

    // Validate the field
    const error = validateField(field, value, step);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  }, [validateField, data.paymentMethod]);

  const validateStep = useCallback((step: CheckoutStep): boolean => {
    console.log('Validating step:', step, 'with data:', data);
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        console.log('daten: ', data);
        if (!data.buyer?.name) newErrors.name = 'Nome é obrigatório';
        else if (!validateName(data.buyer.name)) newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        
        if (!data.buyer?.email) newErrors.email = 'Email é obrigatório';
        else if (!validateEmail(data.buyer.email)) newErrors.email = 'Email inválido';
        
        if (!data.buyer?.document) newErrors.document = 'CPF é obrigatório';
        else if (!validateCPF(data.buyer.document)) newErrors.document = 'CPF inválido';
        
        if (!data.buyer?.phone) newErrors.phone = 'Telefone é obrigatório';
        else if (!validatePhone(data.buyer.phone)) newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
        break;

      case 2:
        if (!data.address?.zipcode) newErrors.zipcode = 'CEP é obrigatório';
        else if (!validateCEP(data.address.zipcode)) newErrors.zipcode = 'CEP deve ter 8 dígitos';
        
        if (!data.address?.street) newErrors.street = 'Logradouro é obrigatório';
        else if (!validateStreet(data.address.street)) newErrors.street = 'Logradouro deve ter pelo menos 3 caracteres';
        
        if (!data.address?.streetNumber) newErrors.streetNumber = 'Número é obrigatório';
        else if (!validateStreetNumber(data.address.streetNumber)) newErrors.streetNumber = 'Número é obrigatório';
        
        if (!data.address?.neighborhood) newErrors.neighborhood = 'Bairro é obrigatório';
        else if (!validateNeighborhood(data.address.neighborhood)) newErrors.neighborhood = 'Bairro deve ter pelo menos 2 caracteres';
        
        if (!data.address?.city) newErrors.city = 'Cidade é obrigatória';
        else if (!validateCity(data.address.city)) newErrors.city = 'Cidade deve ter pelo menos 2 caracteres';
        
        if (!data.address?.state) newErrors.state = 'Estado é obrigatório';
        else if (!validateState(data.address.state)) newErrors.state = 'Estado é obrigatório';
        break;

      case 3:
        if (data.paymentMethod === 'credit_card') {
          if (!data.card?.holderName) newErrors.holderName = 'Nome no cartão é obrigatório';
          else if (!validateName(data.card.holderName)) newErrors.holderName = 'Nome deve ter pelo menos 2 caracteres';
          
          if (!data.card?.number) newErrors.number = 'Número do cartão é obrigatório';
          else if (!validateCardNumber(data.card.number)) newErrors.number = 'Número do cartão inválido';
          
          if (!data.card?.expirationMonth) newErrors.expirationMonth = 'Mês é obrigatório';
          if (!data.card?.expirationYear) newErrors.expirationYear = 'Ano é obrigatório';
          
          if (data.card?.expirationMonth && data.card?.expirationYear) {
            if (!validateExpirationDate(data.card.expirationMonth, data.card.expirationYear)) {
              newErrors.expirationMonth = 'Data de expiração inválida';
            }
          }
          
          if (!data.card?.cvv) newErrors.cvv = 'CVV é obrigatório';
          else if (!validateCVV(data.card.cvv)) newErrors.cvv = 'CVV deve ter 3 ou 4 dígitos';
        }
        break;
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3) as CheckoutStep);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1) as CheckoutStep);
  }, []);

  const processPayment = useCallback(async () => {
    if (!validateStep(3)) return false;

    setIsLoading(true);
    try {
      // Aqui você integraria com a API do Pagar.me
      // Exemplo de requisição (substitua pela implementação real):
      /*
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erro no pagamento');
      
      const result = await response.json();
      return result;
      */
      
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, transactionId: '12345' };
    } catch (error) {
      console.error('Erro no processamento:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data, validateStep]);

  return {
    currentStep,
    data,
    errors,
    isLoading,
    updateBuyerData,
    updateAddressData,
    updateCardData,
    updatePaymentMethod,
    updateField,
    validateField,
    nextStep,
    prevStep,
    processPayment,
    validateStep
  };
};