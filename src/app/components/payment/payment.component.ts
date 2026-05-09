import { Component, inject, OnInit } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { PaymentService } from '../../../core/services/payment.service';
import { MessagesService } from '../../../core/services/messages.service';
import { IUserData } from '../../../core/Interfaces/IUser';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent implements OnInit {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;

  cardNumberElement: any = null;
  cardExpiryElement: any = null;
  cardCvcElement: any = null;

  clientSecret: string = '';
  errorMessage: string = '';
  stripeReady: boolean = false;

  user!: IUserData;

  private _paymetnService = inject(PaymentService);
  private _message = inject(MessagesService);
  private _user = inject(UserService);

  async ngOnInit() {
    this.stripe = await loadStripe(
      'pk_test_51TU70hQz60PSmGZbMyVhNxqHQ0X2YbQuEAJQpMVk4lLp9UW6CiehGV8l2Yul5kHDYVByq0cnLMEu2bOMbTnM6NZY00grLTtlxl',
    );

    this.user = this._user.loadCurrentUser();

    this._paymetnService.CreatePaymentIntent().subscribe({
      next: (req: any) => {
        this.clientSecret = req.data;
        this.setupStripeCard();
      },
      error: (err: any) => {
        this._message.showError('CreatePaymentIntent Failed');
      },
    });
  }

  setupStripeCard() {
    if (this.stripe) {
      this.elements = this.stripe.elements();

      const elementStyles = {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
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
    if (!this.stripe || !this.cardNumberElement || !this.clientSecret) return;

    const result = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.cardNumberElement,
        billing_details: {
          name: this.user.firstName + ' ' + this.user.secondName,
        },
      },
    });

    if (result.error) {
      this.errorMessage = result.error.message || 'الدفع فشل';
    } else {
      if (result.paymentIntent?.status === 'succeeded') {
        alert('ألف مبروك! الدفع تم بنجاح.');
      }
    }
  }
}
