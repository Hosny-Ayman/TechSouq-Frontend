import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { PaymentService } from '../../../core/services/payment.service';
import { MessagesService } from '../../../core/services/messages.service';
import { IUserData } from '../../../core/Interfaces/IUser';
import { UserService } from '../../../core/services/user.service';
import { CartService } from '../../../core/services/cart.service';
import { AddresService } from '../../../core/services/addres.service';
import { AuthService } from '../../../core/services/auth.service';
import { UtilityService } from '../../../core/services/utility.service';
import { DeliveryZoneService } from '../../../core/services/delivery-zone.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Items } from '../../../core/Interfaces/icart-items';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { SystemSettingService } from '../../../core/services/system-setting.service';
import { CouponService } from '../../../core/services/coupon.service';
import { ShowCoupon } from '../../../core/Interfaces/ICoupon';
import { ConfirmOrder } from '../../../core/Interfaces/IConfirmOrder';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    ReactiveFormsModule,
    FormsModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent implements OnInit, OnDestroy {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardNumberElement: any = null;
  cardExpiryElement: any = null;
  cardCvcElement: any = null;
  errorMessage: string = '';
  stripeReady: boolean = false;
  clientSecret: string = '';

  user!: IUserData;
  cartDetails: any[] = [];
  shippingCost: number = 0;
  deliveryZones: any[] = [];

  confirmOrder!: ConfirmOrder;

  private destroy$ = new Subject<void>();
  private cartUpdateSubject = new Subject<void>();
  CartDetailsAnnymouse: any;

  UserCoupon: string = '';
  public FreeShippingShould: number = 0;
  public Coupon: ShowCoupon | null = null;
  public DiscountAmount: number = 0;

  public isProcessing: boolean = false;

  public selectedPaymentMethod: 'card' | 'cash' = 'card';

  platFormId = inject(PLATFORM_ID);
  isbrowser = isPlatformBrowser(this.platFormId);
  private _paymentService = inject(PaymentService);
  private _message = inject(MessagesService);
  private _user = inject(UserService);
  private _cart = inject(CartService);
  private _address = inject(AddresService);
  private _auth = inject(AuthService);
  private _utility = inject(UtilityService);
  private _deliveryZoneService = inject(DeliveryZoneService);
  private _fb = inject(FormBuilder);
  private _Setting = inject(SystemSettingService);
  private _CouponService = inject(CouponService);
  private _router = inject(Router);

  shippingForm: FormGroup = this._fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    country: ['Egypt', Validators.required],
    street: ['', Validators.required],
    building: [''],
    city: ['', Validators.required],
    phone: [
      '',
      [Validators.required, Validators.pattern('^01[0125][0-9]{8}$')],
    ],
    email: ['', [Validators.required, Validators.email]],
  });

  async ngOnInit() {
    this._Setting.GetSystemSettingByKey('FreeShippingThreshold').subscribe({
      next: (req: any) => {
        this.FreeShippingShould = Number(req.data.settingValue);
      },
    });

    this.user = this._user.loadCurrentUser();
    this.loadCartDetails();
    this.loadDeliveryZones();
    this.loadDefaultAddress();

    this.shippingForm.patchValue({
      email: this.user?.email || '',
      firstName: this.user?.firstName || '',
      lastName: this.user?.secondName || '',
    });

    this.cartUpdateSubject
      .pipe(takeUntil(this.destroy$), debounceTime(800))
      .subscribe(() => {
        this.updateCart();
      });

    this.shippingForm
      .get('city')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((newCityName) => {
        if (newCityName) {
          this.CalculateShipping(newCityName);
        }
      });

    this.stripe = await loadStripe(
      'pk_test_51TU70hQz60PSmGZbMyVhNxqHQ0X2YbQuEAJQpMVk4lLp9UW6CiehGV8l2Yul5kHDYVByq0cnLMEu2bOMbTnM6NZY00grLTtlxl',
    );
    this.setupStripeCard();
  }

  setPaymentMethod(method: 'card' | 'cash') {
    this.selectedPaymentMethod = method;
  }

  setupStripeCard() {
    if (this.stripe) {
      this.elements = this.stripe.elements();

      const elementStyles = {
        style: {
          base: {
            fontSize: '15px',
            color: '#1f2937',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            '::placeholder': { color: '#9ca3af' },
          },
          invalid: { color: '#ef4444', iconColor: '#ef4444' },
        },
      };

      this.cardNumberElement = this.elements.create(
        'cardNumber',
        elementStyles,
      );
      this.cardExpiryElement = this.elements.create(
        'cardExpiry',
        elementStyles,
      );
      this.cardCvcElement = this.elements.create('cardCvc', elementStyles);

      this.cardNumberElement.mount('#card-number-element');
      this.cardExpiryElement.mount('#card-expiry-element');
      this.cardCvcElement.mount('#card-cvc-element');

      this.stripeReady = true;
    }
  }

  async pay() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      this._message.showError('Please fill all required shipping information.');
      return;
    }

    const formValues = this.shippingForm.value;
    const fullName = `${formValues.firstName} ${formValues.lastName}`;
    let paymentWayId = 0;
    if (this.selectedPaymentMethod === 'cash') {
      paymentWayId = 1;
    } else {
      paymentWayId = 2;
    }

    this.confirmOrder = {
      shippingFullName: fullName,
      shippingStreet: formValues.street,
      shippingCity: formValues.city,
      email: formValues.email,
      building: formValues.building,
      country: formValues.country,
      phone: formValues.phone,
      paymentWayId: paymentWayId,
      code: this.Coupon?.code,
    };

    if (this.selectedPaymentMethod === 'cash') {
      this._paymentService.CreatePaymentForCash(this.confirmOrder).subscribe({
        next: (req: any) => {
          this._message.showSuccess(
            'ألف مبروك! تم تسجيل الطلب الدفع عند الاستلام بنجاح.',
          );
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
            this._router.navigate(['/User/Order']);
          }, 3000);
        },
        error: (err: any) => {
          this._message.showError('حدث خطاء اثناء تسجيل الطلب حاول لاحقا');
          this.isProcessing = false;
        },
      });
      return;
    }

    if (!this.stripe || !this.cardNumberElement) return;

    this._paymentService.CreatePaymentIntent(this.confirmOrder).subscribe({
      next: async (req: any) => {
        this.clientSecret = req.data;

        const result = await this.stripe!.confirmCardPayment(
          this.clientSecret,
          {
            payment_method: {
              card: this.cardNumberElement,
              billing_details: {
                name: fullName,
                email: formValues.email,
                phone: formValues.phone,
              },
            },
          },
        );

        if (result.error) {
          this.errorMessage = result.error.message || 'الدفع فشل';
          this._message.showError(this.errorMessage);
        } else {
          if (result.paymentIntent?.status === 'succeeded') {
            this.isProcessing = true;
            setTimeout(() => {
              this.isProcessing = false;
              this._router.navigate(['/User/Order']);
            }, 3000);
          }
        }
      },
      error: (err: any) => {
        this._message.showError('CreatePaymentIntent Failed');
        this.isProcessing = false;
      },
    });
  }

  loadDeliveryZones() {
    this._deliveryZoneService.GetAllDeliveryZones().subscribe({
      next: (req: any) => {
        this.deliveryZones = req.data;
      },
    });
  }

  loadDefaultAddress() {
    this._address.GetOnlyDefaultAddress().subscribe({
      next: (req: any) => {
        if (req && req.data) {
          this.shippingForm.patchValue({
            firstName: req.data.firstName,
            lastName: req.data.lastName,
            street: req.data.street,
            building: req.data.building,
            city: req.data.city,
            country: req.data.country || 'Egypt',
            email: req.data.email || this.user.email,
            phone: req.data.phone || '',
          });
        }
      },
    });
  }

  loadCartDetails() {
    if (this._auth.currentUser.value !== null) {
      this._cart
        .GetCartItemsAndProductsDetails()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (req: any) => {
            this.cartDetails = req.data;
            this._cart.ShowCartItems(this.cartDetails.length);
            this.CalculateShipping();
            this.ApplyDiscountLogic();
          },
        });
    } else {
      if (this.isbrowser) {
        const cart = this._utility.getStorageItem('cart');
        this.CartDetailsAnnymouse = cart ? cart : [];
        this.cartDetails = this.CartDetailsAnnymouse;
        this.CalculateShipping();
        this.ApplyDiscountLogic();
      }
    }
  }

  get cartTotal(): number {
    return this.cartDetails.reduce((total, item) => total + item.subtotal, 0);
  }

  CalculateTotalForCoupon(): number {
    return this.cartDetails.reduce((total, item) => {
      if (item.priceAfterDiscount != null) {
        return total;
      }
      return total + item.productPrice * item.quantity;
    }, 0);
  }

  increaseQuantity(item: any) {
    if (item.quantity < item.stock) {
      item.quantity++;
      item.subtotal =
        item.quantity * (item.priceAfterDiscount ?? item.productPrice);
      this.cartUpdateSubject.next();
      this.ApplyDiscountLogic();
    } else {
      this._message.showError('Maximum available stock reached!');
    }
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      item.subtotal =
        item.quantity * (item.priceAfterDiscount ?? item.productPrice);
      this.cartUpdateSubject.next();
      this.ApplyDiscountLogic();
    }
  }

  updateCart(): void {
    const payloadForApi: Items[] = this.cartDetails.map((item) => ({
      cartId: item.cartId ?? 0,
      id: item.cartItemId ?? 0,
      productId: item.productId,
      quantity: item.quantity,
    }));
    this._cart.UpdateCart(payloadForApi).subscribe({
      next: () => {
        this.CalculateShipping();
        this.ApplyDiscountLogic();
      },
    });
  }

  removeItem(item: any) {
    this.cartDetails = this.cartDetails.filter(
      (x) => x.productId !== item.productId,
    );
    this._cart.RemoveCartItem(item.productId).subscribe({
      next: (req: any) => {
        this._cart.ShowCartItems(this.cartDetails.length);
        this.CalculateShipping();
        this.ApplyDiscountLogic();
      },
    });
  }

  CalculateShipping(cityName?: string) {
    if (!this.cartDetails || this.cartDetails.length === 0) {
      this.shippingCost = 0;
      return;
    }

    if (
      this.FreeShippingShould > 0 &&
      this.cartTotal >= this.FreeShippingShould
    ) {
      this.shippingCost = 0;
      return;
    }

    const cityToCalculate = cityName || this.shippingForm.get('city')?.value;
    const hasNotFreeShipping = this.cartDetails.some(
      (item) => item.isFreeShipping === false,
    );

    if (this._auth.currentUser.value !== null) {
      if (hasNotFreeShipping && cityToCalculate) {
        this._address.GetCityShippingCost(cityToCalculate).subscribe({
          next: (req: any) => (this.shippingCost = req.data),
        });
      } else {
        this.shippingCost = 0;
      }
    } else {
      this.shippingCost = hasNotFreeShipping ? 50 : 0;
    }
  }

  GetCoupon(Code: string) {
    if (!Code) {
      this._message.showError('Please enter a coupon code.');
      return;
    }

    this._CouponService.GetCouponByCode(Code).subscribe({
      next: (req: any) => {
        this.Coupon = req.data as ShowCoupon;
        this._message.showSuccess(`Coupon Applied Successfully`);
        this.ApplyDiscountLogic();
      },
      error: (err: any) => {
        this.Coupon = null;
        this.DiscountAmount = 0;
        this._message.showError(`Invalid or Expired Coupon`);
      },
    });
  }

  ApplyDiscountLogic() {
    if (!this.Coupon) {
      this.DiscountAmount = 0;
      return;
    }

    let totalForCoupon = this.cartTotal;

    if (!this.Coupon.isApplicableOnDiscountedItems) {
      totalForCoupon = this.CalculateTotalForCoupon();
      if (totalForCoupon === 0) {
        this._message.showWarning(
          'Coupon applied only on non-discounted products',
        );
        this.DiscountAmount = 0;
        return;
      }
    }

    if (
      this.Coupon.discountType === 'Percentage' ||
      this.Coupon.discountType === (1 as any)
    ) {
      this.DiscountAmount = (totalForCoupon * this.Coupon.discountValue) / 100;
    } else {
      this.DiscountAmount = Math.min(this.Coupon.discountValue, totalForCoupon);
    }
  }

  get finalTotal(): number {
    return this.cartTotal + this.shippingCost - this.DiscountAmount;
  }

  getImageUrl(fileName: string, imagePath: string): string {
    return this._utility.getImageUrl(fileName, imagePath);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
