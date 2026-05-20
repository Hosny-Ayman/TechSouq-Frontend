import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingService {
  constructor(private _htpp: HttpClient) {}

  GetSystemSettingByKey(Key: string): Observable<any> {
    return this._htpp.get(`${baseUrl}SystemSettings/${Key}`);
  }
}
