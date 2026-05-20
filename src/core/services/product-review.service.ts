import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../apiRoot/baseUrl';
import { Review } from '../Interfaces/IReview';

@Injectable({
  providedIn: 'root',
})
export class ProductReviewService {
  constructor(private _http: HttpClient) {}

  CanUserReviewProduct(productId: number): Observable<any> {
    return this._http.get(`${baseUrl}ProductReviews/${productId}`);
  }

  AddReview(review: Review): Observable<any> {
    return this._http.post(`${baseUrl}ProductReviews`, review);
  }

  GetAllReviews(
    pageNumber: number,
    pageSize: number,
    productId: number,
  ): Observable<any> {
    return this._http.get(
      `${baseUrl}ProductReviews/GetAllReviewsPaged?pageNumber=${pageNumber}&pageSize=${pageSize}&productId=${productId}`,
    );
  }

  CanUserEditHisReview(productId: number): Observable<any> {
    return this._http.get(
      `${baseUrl}ProductReviews/CanUserEditHisReview?productId=${productId}`,
    );
  }

  UpdateReview(review: Review): Observable<any> {
    return this._http.put(`${baseUrl}ProductReviews`, review);
  }
}
