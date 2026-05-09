import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../../core/services/cart.service';
import {
  ICartItems,
  ICartItemsAndProductsDetails,
  Items,
} from '../../../../core/Interfaces/icart-items';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { MessagesService } from '../../../../core/services/messages.service'; // ضفت الميسج سيرفس عشان لو عايز تطلع ايرور
import { UtilityService } from '../../../../core/services/utility.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe, RouterModule, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private cartUpdateSubject = new Subject<void>();

  private _utility = inject(UtilityService);

  CartDetailsAnnymouse: any;

  platFormId = inject(PLATFORM_ID);
  isbrowser = isPlatformBrowser(this.platFormId);

  cartDetails: any[] = []; // استخدمت any مؤقتا لو مفيش stock في الانترفيس بتاعك

  constructor(
    private _cart: CartService,
    private _auth: AuthService,
    private _message: MessagesService, // عشان لو حبيت تظهر رسالة
  ) {}

  ngOnInit(): void {
    this.loadCartDetails();

    this.cartUpdateSubject
      .pipe(takeUntil(this.destroy$), debounceTime(800))
      .subscribe(() => {
        this.updateCart();
      });
  }

  loadCartDetails() {
    if (this._auth.currentUser.value !== null) {
      this._cart
        .GetCartItemsAndProductsDetails()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (req: any) => {
            console.log('Data loaded inside Cart Component!', req.data);
            this.cartDetails = req.data;
            this._cart.ShowCartItems(this.cartDetails.length);
          },
          error: (err: any) => {
            console.log('Error loading cart details', err);
          },
        });
    } else {
      if (this.isbrowser) {
        const cart = this._utility.getStorageItem('cart');

        this.CartDetailsAnnymouse = cart;

        this.cartDetails = this.CartDetailsAnnymouse;
      }
    }
  }

  get cartTotal(): number {
    return this.cartDetails.reduce((total, item) => total + item.subtotal, 0);
  }

  increaseQuantity(item: any) {
    if (item.quantity < item.stock) {
      item.quantity++;
      item.subtotal = item.quantity * item.productPrice;
      this.cartUpdateSubject.next();
    } else {
      this._message.showError('Maximum available stock reached!');
    }
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      item.subtotal = item.quantity * item.productPrice;
      this.cartUpdateSubject.next();
    }
  }

  updateCart(): void {
    const payloadForApi: Items[] = this.cartDetails.map((item) => {
      return {
        cartId: item.cartId ?? 0,
        id: item.cartItemId ?? 0,
        productId: item.productId,
        quantity: item.quantity,
      };
    });

    this._cart.UpdateCart(payloadForApi).subscribe({
      next: (req: any) => {
        console.log('Update ItemsCard Successfully', req);
      },
      error: (err: any) => {
        console.log('Update ItemsCard failed', err);
      },
    });
  }

  removeItem(item: any) {
    this.cartDetails = this.cartDetails.filter(
      (x) => x.productId !== item.productId,
    );

    this._cart.RemoveCartItem(item.productId).subscribe({
      next: (req: any) => {
        console.log('Product Remove Successfully', req);
        this._cart.ShowCartItems(this.cartDetails.length);
      },
      error: (err: any) => {
        console.log('Product Remove failed', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
