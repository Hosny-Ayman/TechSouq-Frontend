import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Review } from '../Interfaces/IReview';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductReviewService {
  constructor(private _http: HttpClient) {}

  CanUserReviewProduct(productId: number): Observable<any> {
    return this._http.get(`${environment.apiUrl}ProductReviews/${productId}`);
  }

  AddReview(review: Review): Observable<any> {
    return this._http.post(`${environment.apiUrl}ProductReviews`, review);
  }

  GetAllReviews(
    pageNumber: number,
    pageSize: number,
    productId: number,
  ): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}ProductReviews/GetAllReviewsPaged?pageNumber=${pageNumber}&pageSize=${pageSize}&productId=${productId}`,
    );
  }

  CanUserEditHisReview(productId: number): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}ProductReviews/CanUserEditHisReview?productId=${productId}`,
    );
  }

  UpdateReview(review: Review): Observable<any> {
    return this._http.put(`${environment.apiUrl}ProductReviews`, review);
  }
}
