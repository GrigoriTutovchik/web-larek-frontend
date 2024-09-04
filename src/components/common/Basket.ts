import { View } from "../base/components";
import { createElement,ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/events";

interface IBasketView {
  items: string[];
  total: number;
}

export class Basket extends View<IBasketView> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLElement;

  constructor(container: HTMLElement, events: EventEmitter) {
      super(events, container);

      this._list = ensureElement<HTMLElement>('.basket__list', this.container);
      this._total = this.container.querySelector('.basket__price');
      this._button = this.container.querySelector('.basket__button');


      if (this._button) {
          this._button.addEventListener('click', () => {
              events.emit('order:open');
          });
      }

      this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
        this._list.replaceChildren(...items);
        this.setDisabled(this._button, false);
    } else {
        this.setDisabled(this._button, true);
        this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
            textContent: 'Корзина пуста'
        }));
    }
}

  set total(total: number) {
    this.setText(this._total, String(total));
}
}