import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/Interfaces/IProducts';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { MessagesService } from '../../../core/services/messages.service';
import { ICartItems } from '../../../core/Interfaces/icart-items';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ProductReviewService } from '../../../core/services/product-review.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-product-detils',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detils.component.html',
  styleUrl: './product-detils.component.css',
})
export class ProductDetilsComponent implements OnInit, OnDestroy {
  ProductId!: number;
  ProductDetails!: Product;

  selectedImage: string = '';
  isInCart: boolean = false;

  CanUserReviewProduct: boolean = false;
  userReviewId: number | null = null;
  isEditingReview: boolean = false;
  createdAt: Date = new Date();

  reviews: any[] = [];
  newReviewText: string = '';
  newReviewRating: number = 0;
  hoverRating: number = 0;
  starsArray: number[] = [1, 2, 3, 4, 5];

  reviewPageNumber: number = 1;
  reviewPageSize: number = 10;
  totalReviewPages: number = 1;

  platFormId = inject(PLATFORM_ID);
  isbrowser = isPlatformBrowser(this.platFormId);
  private destroy$ = new Subject<void>();

  constructor(
    private _Products: ProductsService,
    private _route: ActivatedRoute,
    private _cart: CartService,
    private _message: MessagesService,
    public _auth: AuthService,
    private _review: ProductReviewService,
    private _utility: UtilityService,
  ) {}

  ngOnInit(): void {
    if (this.isbrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this._route.paramMap.subscribe((params) => {
      this.ProductId = Number(params.get('id'));

      if (this.ProductId) {
        this.fetchProductData();
        this.checkIfInCart();
        this.checkUserReviewStatus();
        this.loadReviews();
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
      quantity: 1,
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

  checkUserReviewStatus() {
    if (this._auth.currentUser.value !== null) {
      this._review.CanUserReviewProduct(this.ProductId).subscribe({
        next: (req: any) => {
          this.CanUserReviewProduct = req.data;
        },
      });

      this._review.CanUserEditHisReview(this.ProductId).subscribe({
        next: (req: any) => {
          this.userReviewId = req.data;
        },
      });
    }
  }

  loadReviews() {
    this._review
      .GetAllReviews(this.reviewPageNumber, this.reviewPageSize, this.ProductId)
      .subscribe({
        next: (req: any) => {
          this.reviews = req.data.data || [];
          this.totalReviewPages = req.data.totalPages || 1;
        },
        error: (err: any) => {},
      });
  }

  nextReviewPage() {
    if (this.reviewPageNumber < this.totalReviewPages) {
      this.reviewPageNumber++;
      this.loadReviews();
    }
  }

  prevReviewPage() {
    if (this.reviewPageNumber > 1) {
      this.reviewPageNumber--;
      this.loadReviews();
    }
  }

  setRating(star: number) {
    this.newReviewRating = star;
  }

  startEditReview(review: any) {
    this.isEditingReview = true;
    this.newReviewText = review.comment;
    this.newReviewRating = review.rating;
    this.createdAt = review.createdAt;

    const formElement = document.getElementById('review-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  cancelEdit() {
    this.isEditingReview = false;
    this.newReviewText = '';
    this.newReviewRating = 0;
    this.hoverRating = 0;
  }

  submitReview() {
    if (this.newReviewRating === 0) {
      this._message.showError('Please select a star rating.');
      return;
    }
    if (!this.newReviewText.trim()) {
      this._message.showError('Please write your review.');
      return;
    }

    const reviewPayload = {
      id: this.isEditingReview && this.userReviewId ? this.userReviewId : 0,
      productId: this.ProductId,
      rating: this.newReviewRating,
      comment: this.newReviewText,
      createdAt: this.createdAt,
    };

    if (this.isEditingReview) {
      this._review.UpdateReview(reviewPayload).subscribe({
        next: (req: any) => {
          this._message.showSuccess('Review updated successfully.');
          this.cancelEdit();
          this.loadReviews();
        },
        error: (err: any) => {
          this._message.showError('Failed to update review. Please try again.');
        },
      });
    } else {
      this._review.AddReview(reviewPayload).subscribe({
        next: (req: any) => {
          this._message.showSuccess('Thank you! Your review has been posted.');
          this.newReviewText = '';
          this.newReviewRating = 0;
          this.hoverRating = 0;
          this.CanUserReviewProduct = false;
          this.checkUserReviewStatus();
          this.reviewPageNumber = 1;
          this.loadReviews();
        },
        error: (err: any) => {
          this._message.showError('Failed to post review. Please try again.');
        },
      });
    }
  }
  getImageUrl(fileName: string, imagePath: string): string {
    return this._utility.getImageUrl(fileName, imagePath);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
