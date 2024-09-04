export interface IProduct {
  id: string,
  title: string,
  description: string,
  image: string,
  category: ProductCategory,
  price: number | null
} 

export interface IOrder {
  payment: PaymentMethod,
  email: string,
  phone: string,
  address: string,
  total: number | null,
  items: string[]
}

export interface IBascket {
  items:string[];
  total:number;
}

export interface IOrderResult {
  id: string;
  total: number;
}

export type ProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';

export type PaymentMethod = 'cash' | 'card';

export type IOrderForm = Omit<IOrder, 'total' | 'items'>;

export type FormErrors = Partial<Record<keyof IOrder, string>>;