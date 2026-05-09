import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  ICartItems,
  ICartItemsAndProductsDetails,
  Items,
} from '../Interfaces/icart-items';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private _http: HttpClient) {}

  private _auth = inject(AuthService);

  platFormId = inject(PLATFORM_ID);

  utility = inject(UtilityService);

  isbrowser = isPlatformBrowser(this.platFormId);

  private cartSubject = new BehaviorSubject<number>(0);

  cart$ = this.cartSubject.asObservable();

  ShowCartItems(cartItemsNumber: number) {
    this.cartSubject.next(cartItemsNumber);
  }

  getCartAnonymousCkient(): ICartItems[] {
    if (this.isbrowser) {
      const cart = localStorage.getItem('cart');
      try {
        return cart ? (JSON.parse(cart) as ICartItems[]) : [];
      } catch {
        return [];
      }
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
    let cart = this.getCartAnonymousCkient();

    const existingItem = cart.find(
      (item) => item.productId === CartItem.productId,
    );

    if (existingItem) {
      existingItem.quantity += CartItem.quantity;
      existingItem.subtotal = existingItem.quantity * CartItem.productPrice;
    } else {
      cart.push({
        productId: CartItem.productId,
        quantity: CartItem.quantity,
        productName: CartItem.productName,
        productImage: CartItem.productImage,
        productPrice: CartItem.productPrice,
        subtotal: CartItem.productPrice * CartItem.quantity,
        stock: CartItem.stock,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    return of({
      isSuccess: true,
      data: cart.length,
      message: 'Added to local cart',
    });
  }

  UpdateCart(CartItem: Items[]): Observable<any> {
    if (this._auth.currentUser.value !== null) {
      return this._http.put(`${baseUrl}CartItems/UpdateItem`, CartItem);
    }

    if (!this.isbrowser) {
      return of(null);
    }

    const cart = this.utility.getStorageItem('cart');

    if (cart !== null) {
      let allcart = cart as ICartItems[];

      for (let index = 0; index < CartItem.length; index++) {
        allcart[index].quantity = CartItem[index].quantity;
        allcart[index].subtotal =
          allcart[index].quantity * allcart[index].productPrice;
      }

      this.utility.setStorageItem('cart', cart);

      return of({
        isSuccess: true,
        data: cart,
        message: 'Update to local cart',
      });
    } else {
      return of(null);
    }
  }

  RemoveCartItem(ProductId: number): Observable<any> {
    if (this._auth.currentUser.value !== null) {
      return this._http.delete(`${baseUrl}CartItems/RemoveItem`, {
        params: { ProductId: ProductId },
      });
    }

    let cart = this.getCartAnonymousCkient();

    cart = cart.filter((item) => item.productId !== ProductId);

    localStorage.setItem('cart', JSON.stringify(cart));

    return of({ isSuccess: true, data: cart, message: 'Added to local cart' });
  }

  GetCartItems(): Observable<any> {
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

  GetCartLoginClient(productId: number): Observable<any> {
    return this._http.get(`${baseUrl}Carts/Get`, {
      params: { productId: productId },
    });
  }

  GetCartItemsAndProductsDetails(): Observable<any> {
    return this._http.get(`${baseUrl}CartItems/GetCartItemesWithProducts`);
  }

  addItems(Items: ICartItems[]): Observable<any> {
    return this._http.post(`${baseUrl}CartItems/AddItems`, Items);
  }

  AddCartItemsAfterLoginAndCLearLocalStorage(): void {
    const cartitems = localStorage.getItem('cart');

    const cart = cartitems ? (JSON.parse(cartitems) as ICartItems[]) : [];

    if (cart.length !== 0) {
      this.addItems(cart).subscribe({
        next: (req: any) => {
          console.log('items added Successfully', req);
          localStorage.removeItem('cart');
        },
      });
    }
  }

  removeItemsFormlocalStorage(): void {
    localStorage.removeItem('cart');
  }
}
