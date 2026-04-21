import { baseUrl } from './../apiRoot/baseUrl';
import { IProducts } from './../Interfaces/IProducts';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  ): Observable<any> {
    let params: any = { PageNumber: PageNumber, PageSize: PageSize };

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    return this._httpClient.get(`${baseUrl}Products/GetProductsPaged`, {
      params: params,
    });
  }

  public GetProductById(id: number): Observable<any> {
    return this._httpClient.get(`${baseUrl}Products/Get?productId=${id}`);
  }
}
