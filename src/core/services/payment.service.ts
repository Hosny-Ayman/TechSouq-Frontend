import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private _http: HttpClient) {}

  CreatePaymentIntent(): Observable<any> {
    return this._http.post(`${baseUrl}Payments/CreateIntent`, {});
  }
}
