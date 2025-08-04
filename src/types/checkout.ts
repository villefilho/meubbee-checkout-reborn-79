export interface BuyerData {
  name: string;
  email: string;
  document: string;
  phone: string;
}

export interface AddressData {
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  streetNumber: string;
  zipcode: string;
  complement?: string;
}

export interface CardData {
  holderName: string;
  number: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

export interface CheckoutData {
  buyer: BuyerData;
  address: AddressData;
  card?: CardData;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  amount: number;
  description: string;
}

export interface PIXResponse {
  qrCode: string;
  qrCodeUrl: string;
  expiresAt: string;
}

export interface BoletoResponse {
  boletoUrl: string;
  boletoBarcode: string;
  expiresAt: string;
}

export type CheckoutStep = 1 | 2 | 3;

export interface ValidationErrors {
  [key: string]: string;
}