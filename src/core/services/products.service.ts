import { IProducts, Product } from './../Interfaces/IProducts';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private _httpClient: HttpClient) {}

  private searchSource = new BehaviorSubject<string>('');

  currentSearch = this.searchSource.asObservable();

  changeSearchTerm(term: string) {
    this.searchSource.next(term);
  }

  public GetProductsPaged(
    PageNumber: number,
    PageSize: number,
    searchTerm: string = '',
    Catogrie: string = '',
  ): Observable<any> {
    let params: any = { PageNumber: PageNumber, PageSize: PageSize };

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
    if (Catogrie) {
      params.Catogrie = Catogrie;
    }

    return this._httpClient.get(
      `${environment.apiUrl}Products/GetProductsPaged`,
      {
        params: params,
      },
    );
  }

  public GetProductById(id: number): Observable<any> {
    return this._httpClient.get(
      `${environment.apiUrl}Products/Get?productId=${id}`,
    );
  }

  public hasDiscount(product: Product): boolean {
    if (!product.discountStartDate || !product.discountEndDate) return false;

    return new Date() < new Date(product.discountEndDate);
  }

  public getDiscountPercentage(product: Product): number {
    if (
      !product.priceAfterDiscount ||
      product.priceAfterDiscount >= product.price
    ) {
      return 0;
    }

    return Math.round(
      ((product.price - product.priceAfterDiscount) / product.price) * 100,
    );
  }
}
