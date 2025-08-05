import { useState, useCallback, useEffect } from 'react';
import { CheckoutData, CheckoutStep, ValidationErrors, BuyerData, AddressData, CardData, CartItem } from '@/types/checkout';

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

  const validateStep = useCallback((step: CheckoutStep): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!data.buyer?.name) newErrors.name = 'Nome é obrigatório';
        if (!data.buyer?.email) newErrors.email = 'Email é obrigatório';
        else if (!/\S+@\S+\.\S+/.test(data.buyer.email)) newErrors.email = 'Email inválido';
        if (!data.buyer?.document) newErrors.document = 'CPF é obrigatório';
        else {
          const { validateCPF } = require('@/utils/formatters');
          if (!validateCPF(data.buyer.document)) newErrors.document = 'CPF inválido';
        }
        if (!data.buyer?.phone) newErrors.phone = 'Telefone é obrigatório';
        break;

      case 2:
        if (!data.address?.zipcode) newErrors.zipcode = 'CEP é obrigatório';
        if (!data.address?.street) newErrors.street = 'Logradouro é obrigatório';
        if (!data.address?.streetNumber) newErrors.streetNumber = 'Número é obrigatório';
        if (!data.address?.neighborhood) newErrors.neighborhood = 'Bairro é obrigatório';
        if (!data.address?.city) newErrors.city = 'Cidade é obrigatória';
        if (!data.address?.state) newErrors.state = 'Estado é obrigatório';
        break;

      case 3:
        if (data.paymentMethod === 'credit_card') {
          if (!data.card?.holderName) newErrors.holderName = 'Nome no cartão é obrigatório';
          if (!data.card?.number) newErrors.number = 'Número do cartão é obrigatório';
          if (!data.card?.expirationMonth) newErrors.expirationMonth = 'Mês é obrigatório';
          if (!data.card?.expirationYear) newErrors.expirationYear = 'Ano é obrigatório';
          if (!data.card?.cvv) newErrors.cvv = 'CVV é obrigatório';
        }
        break;
    }

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
    nextStep,
    prevStep,
    processPayment,
    validateStep
  };
};