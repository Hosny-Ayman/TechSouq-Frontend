import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';

@Injectable({
  providedIn: 'root',
})
export class CategorieService {
  constructor(private _http: HttpClient) {}

  GetAllCategories(PageNumber: number, PageSize: number): Observable<any> {
    return this._http.get(`${baseUrl}Categories/GetAllCategoriesAsync`, {
      params: { PageNumber: PageNumber, PageSize: PageSize },
    });
  }
}
