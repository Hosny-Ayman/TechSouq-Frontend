import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingService {
  constructor(private _htpp: HttpClient) {}

  GetSystemSettingByKey(Key: string): Observable<any> {
    return this._htpp.get(`${environment.apiUrl}SystemSettings/${Key}`);
  }
}
