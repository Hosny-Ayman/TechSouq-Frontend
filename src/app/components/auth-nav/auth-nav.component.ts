import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ICartItems,
  ICartItemsAndProductsDetails,
} from '../../../core/Interfaces/icart-items';
import { ProductsService } from '../../../core/services/products.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-nav',
  standalone: true,
  imports: [
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './auth-nav.component.html',
  styleUrl: './auth-nav.component.css',
})
export class AuthNavComponent {
  CartItems!: ICartItems[];

  searchWord: string = '';

  private destroy$ = new Subject<void>();

  cartCount: number = 0;

  items: MenuItem[] | undefined;

  constructor(
    private _Products: ProductsService,
    private _cart: CartService,
    private _auth: AuthService,
  ) {}

  ngOnInit() {
    this.items = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/Home' },
      { label: 'Contact', icon: 'pi pi-phone', routerLink: '/Contact' },
      { label: 'About', icon: 'pi pi-info-circle', routerLink: '/About' },
      { label: 'Sign Up', icon: 'pi pi-user', routerLink: '/Register' },
    ];

    this.loadCart();

    this._cart.cart$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: number) => {
        this.cartCount = res;
      },
    });
  }

  onSearch() {
    this._Products.changeSearchTerm(this.searchWord);
  }

  onInputClear(value: string) {
    // لو الـ input بقى فاضي، هنفضي كلمة البحث من السيرفيس فوراً
    if (value.trim() === '') {
      this._Products.changeSearchTerm('');
      // مش بنعمل navigate هنا عشان مش عايزينه ينط لصفحة الهوم بمجرد إنه بيمسح الكلام
    }
  }
  loadCart() {
    if (this._auth.currentUser.value !== null) {
      this._cart.GetCartItems().subscribe({
        next: (res: any) => {
          console.log('CartItem', res.data);
          this.CartItems = res.data;
          // خد بالك: طالما إنت بتجيب GetCartItems (السلة كلها)، يبقى res.data عبارة عن مصفوفة، فهنعد الـ length بتاعها
          const count = res.data ? res.data.length : 0;
          this._cart.ShowCartItems(count); // 👈 لازم تنادي دي عشان تفوق البادج
        },
      });
    } else {
      const cart = this._cart.getCartAnonymousCkient();
      this._cart.ShowCartItems(cart.length); // 👈 وهنا كمان
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
