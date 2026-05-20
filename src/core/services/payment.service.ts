import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';
import { ConfirmOrder } from '../Interfaces/IConfirmOrder';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private _http: HttpClient) {}

  CreatePaymentIntent(confirmOrder: ConfirmOrder): Observable<any> {
    return this._http.post(`${baseUrl}Payments/CreateIntent`, confirmOrder);
  }

  CreatePaymentForCash(confirmOrder: ConfirmOrder): Observable<any> {
    return this._http.post(`${baseUrl}Payments/CreateCash`, confirmOrder);
  }
}
