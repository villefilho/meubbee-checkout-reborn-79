export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return value;
};

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return value;
};

export const formatCardNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 16) {
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
  return value;
};

export const formatExpirationDate = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 4) {
    return numbers.replace(/(\d{2})(\d{2})/, '$1/$2');
  }
  return value;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
};

export const onlyNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;

  return true;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// New validation functions for real-time validation
export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

export const validateCEP = (cep: string): boolean => {
  const numbers = cep.replace(/\D/g, '');
  return numbers.length === 8;
};

export const validateCardNumber = (number: string): boolean => {
  const numbers = number.replace(/\D/g, '');
  if (numbers.length < 13 || numbers.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = numbers.length - 1; i >= 0; i--) {
    let digit = parseInt(numbers[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const validateCVV = (cvv: string): boolean => {
  const numbers = cvv.replace(/\D/g, '');
  return numbers.length >= 3 && numbers.length <= 4;
};

export const validateExpirationDate = (month: string, year: string): boolean => {
  if (!month || !year) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  if (expMonth < 1 || expMonth > 12) return false;
  
  return true;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
};

export const validateStreet = (street: string): boolean => {
  return street.trim().length >= 3;
};

export const validateStreetNumber = (number: string): boolean => {
  return number.trim().length >= 1;
};

export const validateNeighborhood = (neighborhood: string): boolean => {
  return neighborhood.trim().length >= 2;
};

export const validateCity = (city: string): boolean => {
  return city.trim().length >= 2;
};

export const validateState = (state: string): boolean => {
  return state.length === 2;
};