import './scss/styles.scss';
import { WebLarekAPI } from './components/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IOrder, IProduct, IOrderForm } from './types';
import { Card } from './components/Card';
import { Modal } from './components/common/Modal';
import { EventEmitter } from './components/base/events';
import { AppData } from './components/AppData';
import { Page } from './components/Page';
import { Basket } from './components/common/Basket';
import { Success } from './components/common/Succes';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL, {});
const appData = new AppData(events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);


const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const success = new Success(cloneTemplate(successTemplate), events);

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new Order(cloneTemplate(orderFormTemplate), events);
const contactsForm = new Contacts(cloneTemplate(contactsFormTemplate), events);

events.on('order:result', () => {
	appData.clearBasket();
	modal.close();
})

events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
	appData.setOrderField(data.field, data.value);
}
);

events.on(/^order\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
appData.setOrderField(data.field, data.value);
});


events.on('contacts:submit', () => {
	api.orderProducts(appData.order)
			.then(result => {
					modal.render({
							content: success.render({
									total: result.total,
							})
					});
					appData.clearBasket();
			})
			.catch(err => console.log(err))
})

events.on('order:open', () => {
	modal.render({
		content: orderForm.render({
			payment: 'card',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('order:submit', () => {
  modal.render({
    content: contactsForm.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  });
});

events.on('order:ready', (order: IOrder) => {
  contactsForm.valid = true;
});

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const { payment, address, email, phone } = errors;
  orderForm.valid = !payment && !address;
	contactsForm.valid = !email && !phone;
  orderForm.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
  contactsForm.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

events.on('basket:open', () => {
  modal.render({
    content: basket.render()
  });
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

events.on('card:select', (item: IProduct) => {
	appData.setPreview(item);
});


events.on('basket:change', () => {
	page.counter = appData.basket.items.length;
	basket.items = appData.basket.items.map((id) => {
		const item = appData.items.find((item) => item.id === id);
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => appData.removeFromBasket(item!),
		});
		return card.render(item);
	});
	basket.total = appData.basket.total;
});

events.on('preview:change', (item: IProduct) => {
	if (item) {
		const card = new Card(cloneTemplate(cardPreviewTemplate), {
			onClick: () => {
				if (appData.inBasket(item)) {
					appData.removeFromBasket(item);
					card.button = 'В корзину';
				} else {
					appData.addToBasket(item);
					card.button = 'Удалить из корзины';
				}
			},
		});
		card.button = appData.inBasket(item)
			? 'Удалить из корзины'
			: 'В корзину';
		modal.render({
			content: card.render(item),
		});
	} else {
		modal.close();
	}
});

events.on('items:change', (items: IProduct[]) => {
	page.galeryItems = items.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render(item);
	});
	console.log('hello');
});

api.getProductList()
	.then((res) => {
		appData.setItems(res);
	})
	.catch((err) => {
		console.error(err);
	});
