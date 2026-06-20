import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private _http: HttpClient) {}

  GetOrderSummary(): Observable<any> {
    return this._http.get(`${environment.apiUrl}Orders/GetOrderSummary`);
  }
}
