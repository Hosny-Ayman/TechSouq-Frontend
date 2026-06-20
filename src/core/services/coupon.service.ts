import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  constructor(private _http: HttpClient) {}

  GetCouponByCode(Code: string): Observable<any> {
    return this._http.get(`${environment.apiUrl}Coupons?Code=${Code}`);
  }
}
