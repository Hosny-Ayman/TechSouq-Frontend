import {
  ICartItems,
  ICartItemsAndProductsDetails,
} from './../../../core/Interfaces/icart-items';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { IProducts, Product } from '../../../core/Interfaces/IProducts';
import { ProductsService } from '../../../core/services/products.service';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ICategorie, IData } from '../../../core/Interfaces/ICategorie';
import { CategorieService } from '../../../core/services/categorie.service';
import { MessagesService } from '../../../core/services/messages.service';
import { UtilityService } from '../../../core/services/utility.service';

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
export class HomeComponent implements OnInit, OnDestroy {
  CartItmesAndProducts!: ICartItemsAndProductsDetails[];

  cartProductIds: Set<number> = new Set<number>();

  private updateSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  currentProductPage: number = 1;
  productPageSize: number = 10;

  allcategories: IData[] = [];
  currentCategoryPage: number = 1;
  categoryPageSize: number = 6;
  totalCategoryPages: number = 1;

  cartItems: ICartItems[] = [];

  platFormId = inject(PLATFORM_ID);
  isbrowser = isPlatformBrowser(this.platFormId);

  currentSearchWord: string = '';
  CatigourySearsh: string = '';

  images: any[] = [];
  responsiveOptions: any[] = [];

  Products!: IProducts;
  betProducts!: Product[];

  constructor(
    private _Products: ProductsService,
    private _auth: AuthService,
    private _cart: CartService,
    private _categorie: CategorieService,
    private _message: MessagesService,
    private _utility: UtilityService,
  ) {}

  ngOnInit() {
    this.responsiveOptions = [
      { breakpoint: '1024px', numVisible: 5 },
      { breakpoint: '768px', numVisible: 3 },
      { breakpoint: '560px', numVisible: 1 },
    ];

    this.loadCartIds();

    this._Products.currentSearch.pipe(takeUntil(this.destroy$)).subscribe({
      next: (term: string) => {
        this.currentSearchWord = term;
        this.currentProductPage = 1;
        this.GetProductsPage(this.currentProductPage, this.productPageSize);
      },
    });

    this.updateSubject
      .pipe(takeUntil(this.destroy$), debounceTime(800))
      .subscribe((product: any) => {
        if (this.isProductInCart(product.id)) {
          this._message.showError('This product is already in your cart!');
          return;
        }
        if (product.stock === 0) {
          this._message.showError('This product is out of stock!');
          return;
        }

        const finalPrice =
          this.hasDiscount(product) && product.priceAfterDiscount
            ? product.priceAfterDiscount
            : product.price;

        const cartItems: ICartItems = {
          productId: product.id,
          quantity: 1,
          productName: product.name,
          productImage: product.firstImage,
          productPrice: finalPrice,
          stock: product.stock,
        };

        this._cart.addCartItem(cartItems).subscribe({
          next: (req: any) => {
            console.log('addToCart', req);
            this._message.showSuccess('Product added To Cart Successfully');

            this.cartProductIds.add(product.id);

            if (req && req.data !== undefined) {
              this._cart.ShowCartItems(req.data);
            }
          },
          error: (err: any) => {
            this._message.showError('Failed to add product to cart');
          },
        });
      });

    this.GetAllCategories(this.currentCategoryPage, this.categoryPageSize);
  }

  loadCartIds() {
    if (this._auth.currentUser.value !== null) {
      this._cart
        .GetCartItemsAndProductsDetails()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (req: any) => {
            if (req && req.data) {
              const items: ICartItemsAndProductsDetails[] = req.data;
              items.forEach((item: any) =>
                this.cartProductIds.add(item.productId),
              );
              console.log('loadCartIds Sucessfully', req);
            }
          },
          error: (err: any) => console.log('loadCartIds Failed', err),
        });
    } else {
      if (this.isbrowser) {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const items = JSON.parse(cart);
          items.forEach((item: any) => this.cartProductIds.add(item.productId));
        }
      }
    }
  }

  isProductInCart(productId: number): boolean {
    return this.cartProductIds.has(productId);
  }

  selectCategory(name: string) {
    if (this.CatigourySearsh === name) {
      this.CatigourySearsh = '';
    } else {
      this.CatigourySearsh = name;
    }
    this.currentProductPage = 1;
    this.GetProductsPage(this.currentProductPage, this.productPageSize);
  }

  GetProductsPage(PageNumber: number, PageSize: number) {
    this._Products
      .GetProductsPaged(
        PageNumber,
        PageSize,
        this.currentSearchWord,
        this.CatigourySearsh,
      )
      .subscribe({
        next: (respons: IProducts) => {
          this.Products = respons;
          this.betProducts = respons.data.data;
          if (this.betProducts && this.betProducts.length > 0) {
            this.images = this.betProducts.map((product: Product) => {
              return {
                id: product.id,
                itemImageSrc: product.firstImage
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
    this.currentProductPage = event.page + 1;
    this.productPageSize = event.rows;
    this.GetProductsPage(this.currentProductPage, this.productPageSize);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToCart(product: any): void {
    if (this.isProductInCart(product.id) || product.stock === 0) return;
    this.updateSubject.next(product);
  }

  GetAllCategories(pageNumber: number, pageSize: number): void {
    this._categorie.GetAllCategories(pageNumber, pageSize).subscribe({
      next: (req: any) => {
        this.allcategories = req.data.data;
        this.currentCategoryPage = req.data.currentPage;
        this.totalCategoryPages = req.data.totalPages;
      },
      error: (error: any) => {
        console.log('Get allcategories Failed', error);
      },
    });
  }

  nextCategoryPage() {
    if (this.currentCategoryPage < this.totalCategoryPages) {
      this.currentCategoryPage++;
      this.GetAllCategories(this.currentCategoryPage, this.categoryPageSize);
    }
  }

  prevCategoryPage() {
    if (this.currentCategoryPage > 1) {
      this.currentCategoryPage--;
      this.GetAllCategories(this.currentCategoryPage, this.categoryPageSize);
    }
  }

  hasDiscount(product: Product): boolean {
    return this._Products.hasDiscount(product);
  }

  getImageUrl(fileName: string, imagePath: string): string {
    return this._utility.getImageUrl(fileName, imagePath);
  }

  getDiscountPercentage(product: Product): number {
    return this._Products.getDiscountPercentage(product);
  }
}
