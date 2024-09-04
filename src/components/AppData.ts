import { IEvents } from "./base/events";
import { IBascket,IOrder,IProduct,IOrderForm,PaymentMethod, FormErrors } from "../types";

export class AppData {
  items: IProduct[] = [];
  preview: IProduct = null;
  basket: IBascket = {
    items: [],
    total: 0
  }
  order: IOrder = {
    payment: 'card',
    email: '',
    phone: '',
    address: '',
    total: 0,
    items: []
  }
  formErrors: FormErrors = {};

constructor(protected events: IEvents) {

}

setItems(items: IProduct[]) {
  this.items = items;
  this.events.emit('items:change', this.items);
}

setPreview(item: IProduct) {
  this.preview = item;
  this.events.emit('preview:change', this.preview);
}

inBasket(item: IProduct) {
  return this.basket.items.includes(item.id);
}

addToBasket(item: IProduct) {
  this.basket.items.push(item.id);
  this.basket.total += item.price;
  this.events.emit('basket:change', this.basket)
}

removeFromBasket(item: IProduct) {
  this.basket.items = this.basket.items.filter(id => id != item.id);
  this.basket.total -= item.price;
  this.events.emit('basket:change',this.basket);
}

clearBasket() {
  this.basket.items = [];
  this.basket.total = 0;
  this.events.emit('basket:change', this.basket);
}

setOrderField(field: keyof IOrderForm, value: string) {
  if (field === 'payment') {
      this.order.payment = value as PaymentMethod;
  } else {
      this.order[field] = value;
  }

  if (this.order.payment && this.validateOrder()) {
      this.order.items = this.basket.items;
      this.order.total = this.basket.total;
      this.events.emit('order:ready', this.order);
  }
}

validateOrder(){
  const errors: typeof this.formErrors = {};
  if (!this.order.payment) {
    errors.payment = 'Необходимо выбрать способ оплаты';
  }
  if (!this.order.email) {
    errors.email = 'Необходимо указать email';
  }
  if (!this.order.phone) {
    errors.phone = 'Необходимо указать телефон';
  }
  if (!this.order.address) {
    errors.address = 'Необходимо указать адрес';
  }
  this.formErrors = errors;
  this.events.emit ('formErrors:change', this.formErrors);
  return Object.keys(errors).length === 0;
}
}