import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmOrder } from '../Interfaces/IConfirmOrder';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private _http: HttpClient) {}

  CreatePaymentIntent(confirmOrder: ConfirmOrder): Observable<any> {
    return this._http.post(
      `${environment.apiUrl}Payments/CreateIntent`,
      confirmOrder,
    );
  }

  CreatePaymentForCash(confirmOrder: ConfirmOrder): Observable<any> {
    return this._http.post(
      `${environment.apiUrl}Payments/CreateCash`,
      confirmOrder,
    );
  }
}
