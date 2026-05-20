import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private _http: HttpClient) {}

  GetOrderSummary(): Observable<any> {
    return this._http.get(`${baseUrl}Orders/GetOrderSummary`);
  }
}
