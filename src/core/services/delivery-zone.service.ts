import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDeliveryZone } from '../Interfaces/IDeliveryZone';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeliveryZoneService {
  constructor(private _http: HttpClient) {}

  AddDeliveryZone(deliveryZone: IDeliveryZone): Observable<any> {
    return this._http.post(`${environment.apiUrl}DeliveryZones`, {});
  }

  GetAllDeliveryZones(): Observable<any> {
    return this._http.get(`${environment.apiUrl}DeliveryZones`, {});
  }
}
