import { Component } from './base/components';
import {IEvents} from './base/events';
import {ensureElement} from '../utils/utils';

export interface IPage {
  basketCount: HTMLElement;
  galeryItems: HTMLElement[];
  locked: boolean;
}

export class Page extends Component<IPage> {
  protected _counter: HTMLElement;
  protected _galery: HTMLElement;
  protected _basket: HTMLElement;
  protected _wrapper: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._counter = ensureElement<HTMLElement>('.header__basket-counter');
    this._galery = ensureElement<HTMLElement>('.gallery');
    this._basket = ensureElement<HTMLElement>('.header__basket');
    this._wrapper = ensureElement<HTMLElement>('.page__wrapper');

    this._basket.addEventListener('click', () => {
        this.events.emit('basket:open');
    });
  }

  set counter(value: number) {
    this.setText(this._counter, String(value));
}

  set galeryItems(items: HTMLElement[]) {
    this._galery.append(...items);
}

  set locked(value: boolean) {
    if (value) {
        this._wrapper.classList.add('page__wrapper_locked');
    } else {
        this._wrapper.classList.remove('page__wrapper_locked');
    }
  }
}