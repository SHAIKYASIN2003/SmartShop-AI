export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  rating: number;
  category: string;
  imageKeyword: string;
  productUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  type: 'HOME' | 'WORK' | 'OTHER';
}

export enum PaymentMethodType {
  CARD = 'CARD',
  UPI = 'UPI',
  COD = 'COD'
}

export interface PaymentDetails {
  method: PaymentMethodType;
  upiApp?: string; // e.g., 'GPay', 'PhonePe'
  cardNumber?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface PrizeTranslation {
  language: string;
  message: string;
}

export type ViewState = 'HOME' | 'CART' | 'CHECKOUT' | 'SUCCESS';

export interface SearchState {
  query: string;
  results: Product[];
  isLoading: boolean;
  error: string | null;
}