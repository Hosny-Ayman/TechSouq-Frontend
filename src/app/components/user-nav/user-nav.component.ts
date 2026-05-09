import { Component, inject, PLATFORM_ID } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { Router, RouterModule } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-user-nav',
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
    ButtonModule,
  ],
  templateUrl: './user-nav.component.html',
  styleUrl: './user-nav.component.css',
})
export class UserNavComponent {
  searchWord: string = '';

  private destroy$ = new Subject<void>();

  cartCount: number = 0;

  constructor(
    private _Products: ProductsService,
    private _auth: AuthService,
    private _cart: CartService,
    private _router: Router,
  ) {}

  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/Home' },
      { label: 'Contact', icon: 'pi pi-phone', routerLink: '/Contact' },
      { label: 'About', icon: 'pi pi-info-circle', routerLink: '/About' },
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

  onInputClear() {
    // لو الـ input بقى فاضي، هنفضي كلمة البحث من السيرفيس فوراً عشان السيستم ينسى
    if (!this.searchWord || this.searchWord.trim() === '') {
      this._Products.changeSearchTerm('');
    }
  }
  logout() {
    this._auth.logout().subscribe({
      next: (req: any) => {
        console.log('Logout success', req);
      },
      error: (err: any) => {
        console.log('Logout Failed', err);
      },
    });
  }

  loadCart() {
    if (this._auth.currentUser.value !== null) {
      this._cart.GetCartItems().subscribe({
        next: (res: any) => {
          console.log('CartItem', res.data);
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
