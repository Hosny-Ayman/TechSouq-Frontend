import { IcartItemsAnonymous } from './../Interfaces/icart-items';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ICartItems } from '../Interfaces/icart-items';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private _http: HttpClient) {}

  private _auth = inject(AuthService);

  platFormId = inject(PLATFORM_ID);

  isbrowser = isPlatformBrowser(this.platFormId);

  private cartSubject = new BehaviorSubject<IcartItemsAnonymous[]>([]);

  cart$ = this.cartSubject.asObservable();

  updateCartAnonymous(cart: IcartItemsAnonymous[]) {
    this.cartSubject.next(cart);
  }

  getCart(): IcartItemsAnonymous[] {
    if (this.isbrowser) {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    }
    return [];
  }

  addCartItem(CartItem: ICartItems): Observable<any> {
    if (this._auth.currentUser.value !== null) {
      return this._http.post(`${baseUrl}CartItems/AddItem`, CartItem);
    }

    if (!this.isbrowser) {
      return of(null);
    }
    let cart = this.getCart();

    const existingItem = cart.find(
      (item) => item.productId === CartItem.productId,
    );

    if (existingItem) {
      existingItem.quantity += CartItem.quantity;
    } else {
      cart.push({
        productId: CartItem.productId,
        quantity: CartItem.quantity,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    return of({ isSuccess: true, data: cart, message: 'Added to local cart' });
  }

  UpdateCart(CartItem: ICartItems): Observable<any> {
    return this._http.put(`${baseUrl}CartItems/UpdateItem`, CartItem);
  }

  RemoveCartItem(ProductId: number): Observable<any> {
    if (this._auth.currentUser.value !== null) {
      return this._http.delete(`${baseUrl}CartItems/RemoveItem`, {
        params: { ProductId: ProductId },
      });
    }

    let cart = this.getCart();

    cart = cart.filter((item) => item.productId !== ProductId);

    localStorage.setItem('cart', JSON.stringify(cart));

    return of({ isSuccess: true, data: cart, message: 'Added to local cart' });
  }

  GetCartItem(): Observable<any> {
    if (this._auth.currentUser.value !== null) {
      return this._http.get(`${baseUrl}CartItems/Get`);
    }

    if (!this.isbrowser) {
      return of(null);
    }

    const cartString = localStorage.getItem('cart');
    const cartData = cartString ? JSON.parse(cartString) : [];

    return of({
      isSuccess: true,
      data: cartData,
      message: 'Fetched local cart successfully',
    });
  }
}
