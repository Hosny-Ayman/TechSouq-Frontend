import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Product } from '../../../core/Interfaces/IProducts';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { MessagesService } from '../../../core/services/messages.service';
import { ICartItems } from '../../../core/Interfaces/icart-items';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-detils',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detils.component.html',
  styleUrl: './product-detils.component.css',
})
export class ProductDetilsComponent implements OnInit, OnDestroy {
  ProductId!: number;
  ProductDetails!: Product;

  selectedImage: string = '';
  isInCart: boolean = false;

  platFormId = inject(PLATFORM_ID);
  isbrowser = isPlatformBrowser(this.platFormId);
  private destroy$ = new Subject<void>();

  constructor(
    private _Products: ProductsService,
    private _route: ActivatedRoute,
    private _cart: CartService,
    private _message: MessagesService,
    private _auth: AuthService,
  ) {}

  ngOnInit(): void {
    this._route.paramMap.subscribe((params) => {
      this.ProductId = Number(params.get('id'));

      if (this.ProductId) {
        this.fetchProductData();
        this.checkIfInCart();
      }
    });
  }

  fetchProductData() {
    this._Products.GetProductById(this.ProductId).subscribe({
      next: (res: any) => {
        this.ProductDetails = res.data;
        if (this.ProductDetails.images?.length > 0) {
          this.selectedImage = this.ProductDetails.images[0];
        } else if (this.ProductDetails.firstImage) {
          this.selectedImage = this.ProductDetails.firstImage;
        }
      },
    });
  }

  checkIfInCart() {
    if (this._auth.currentUser.value !== null) {
      this._cart
        .GetCartItemsAndProductsDetails()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (req: any) => {
            if (req && req.data) {
              const items = req.data;
              this.isInCart = items.some(
                (item: any) => item.productId === this.ProductId,
              );
            }
          },
        });
    } else {
      if (this.isbrowser) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.isInCart = cart.some(
          (item: any) => item.productId === this.ProductId,
        );
      }
    }
  }

  changeImage(img: string) {
    this.selectedImage = img;
  }

  hasDiscount(product: Product): boolean {
    return this._Products.hasDiscount(product);
  }

  getDiscountPercentage(product: Product): number {
    return this._Products.getDiscountPercentage(product);
  }

  addToCart() {
    if (!this.ProductDetails || this.isInCart) return;

    const finalPrice =
      this.hasDiscount(this.ProductDetails) &&
      this.ProductDetails.priceAfterDiscount
        ? this.ProductDetails.priceAfterDiscount
        : this.ProductDetails.price;

    const cartItem: ICartItems = {
      productId: this.ProductDetails.id,
      quantity: 1, // خلينا الكمية دايما 1 هنا
      productName: this.ProductDetails.name,
      productImage: this.ProductDetails.firstImage,
      productPrice: finalPrice,
      stock: this.ProductDetails.stock,
    };

    this._cart.addCartItem(cartItem).subscribe({
      next: (req: any) => {
        this._message.showSuccess('Product added to cart successfully');
        this.isInCart = true;

        if (req && req.data !== undefined) {
          this._cart.ShowCartItems(req.data);
        }
      },
      error: (err: any) => {
        this._message.showError('Failed to add product to cart');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
