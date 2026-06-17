import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
import { SystemSettingService } from '../../../core/services/system-setting.service';
import { UtilityService } from '../../../core/services/utility.service';

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
export class UserNavComponent implements OnInit {
  private _utilati = inject(UtilityService);
  private _systemSettings = inject(SystemSettingService);

  mainImage: string = '';
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

    this.getmainImage();

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
    if (!this.searchWord || this.searchWord.trim() === '') {
      this._Products.changeSearchTerm('');
    }
  }
  logout() {
    this._auth.logout().subscribe({
      next: (req: any) => {},
      error: (err: any) => {},
    });
  }

  loadCart() {
    if (this._auth.currentUser.value !== null) {
      this._cart.GetCartItems().subscribe({
        next: (res: any) => {
          const count = res.data ? res.data.length : 0;
          this._cart.ShowCartItems(count);
        },
      });
    } else {
      const cart = this._cart.getCartAnonymousCkient();
      this._cart.ShowCartItems(cart.length);
    }
  }

  loadImage(fileName: string, imagePath: string): string {
    return this._utilati.getImageUrl(fileName, imagePath);
  }

  getmainImage() {
    this._systemSettings.GetSystemSettingByKey('SiteLogo').subscribe({
      next: (req: any) => {
        this.mainImage = req.data.settingValue;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
