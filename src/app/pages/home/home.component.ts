import { IcartItemsAnonymous } from './../../../core/Interfaces/icart-items';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { IProducts, Product } from '../../../core/Interfaces/IProducts';
import { ProductsService } from '../../../core/services/products.service';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    GalleriaModule,
    PaginatorModule,
    FormsModule,
    MenubarModule,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private destroy$ = new Subject<void>();

  cartItems: IcartItemsAnonymous[] = [];

  platFormId = inject(PLATFORM_ID);

  Cart!: Product[];

  isbrowser = isPlatformBrowser(this.platFormId);

  currentSearchWord: string = '';
  constructor(
    private _Products: ProductsService,
    private _auth: AuthService,
    private _cart: CartService,
  ) {}

  images: any[] = [];
  responsiveOptions: any[] = [];

  Products!: IProducts;
  betProducts!: Product[];

  ngOnInit() {
    this.responsiveOptions = [
      { breakpoint: '1024px', numVisible: 5 },
      { breakpoint: '768px', numVisible: 3 },
      { breakpoint: '560px', numVisible: 1 },
    ];

    this._Products.currentSearch.pipe(takeUntil(this.destroy$)).subscribe({
      next: (term: string) => {
        this.currentSearchWord = term;
        this.GetProductsPage(1, 10);
      },
    });

    // this.cartItems = this.getCartItems();

    this._cart.cart$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (cart: any[]) => {
        this.cartItems = this.getCartItems();
      },
    });
  }

  GetProductsPage(PageNumber: number, PageSize: number) {
    this._Products
      .GetProductsPaged(PageNumber, PageSize, this.currentSearchWord)
      .subscribe({
        next: (respons: IProducts) => {
          this.Products = respons;
          console.log('Data from API:', respons);
          this.betProducts = respons.data.data;
          if (this.betProducts && this.betProducts.length > 0) {
            this.images = this.betProducts.map((product: Product) => {
              return {
                id: product.id,
                itemImageSrc: product.firstImage
                  ? product.firstImage
                  : 'https://placehold.co/800x400?text=No+Image',

                thumbnailImageSrc: product.firstImage
                  ? product.firstImage
                  : 'https://placehold.co/800x400?text=No+Image',

                title: product.name,
                alt: product.name,
              };
            });
          }
        },
        error: (err) => console.log(err),
      });
  }

  onPageChange(event: any) {
    const nextPage = event.page + 1;

    const newPageSize = event.rows;

    this.GetProductsPage(nextPage, newPageSize);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCart(): IcartItemsAnonymous[] {
    if (this.isbrowser) {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    }
    return [];
  }

  addToCart(cartItemsAnonymous: IcartItemsAnonymous) {
    if (!this.isbrowser) {
      return;
    }
    let cart = this.getCart();

    const existingItem = cart.find(
      (item) => item.productId === cartItemsAnonymous.productId,
    );

    if (existingItem) {
      existingItem.quantity += cartItemsAnonymous.quantity;
    } else {
      cart.push({
        productId: cartItemsAnonymous.productId,
        quantity: cartItemsAnonymous.quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    this._cart.updateCartAnonymous(cart);
  }

  getCartItems() {
    return this.getCart();
  }

  removeFromCart(productId: number) {
    let cart = this.getCart();

    cart = cart.filter((item) => item.productId !== productId);

    localStorage.setItem('cart', JSON.stringify(cart));
  }

  decreaseQuantity(productId: number) {
    if (this.isbrowser) {
      let cart = this.getCart();

      const item = cart.find((x) => x.productId === productId);

      if (item) {
        item.quantity--;

        if (item.quantity <= 0) {
          cart = cart.filter((x) => x.productId !== productId);
        }
      }

      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
}
