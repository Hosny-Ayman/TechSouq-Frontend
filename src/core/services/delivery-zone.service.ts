import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDeliveryZone } from '../Interfaces/IDeliveryZone';
import { Observable } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';

@Injectable({
  providedIn: 'root',
})
export class DeliveryZoneService {
  constructor(private _http: HttpClient) {}

  AddDeliveryZone(deliveryZone: IDeliveryZone): Observable<any> {
    return this._http.post(`${baseUrl}DeliveryZones`, {});
  }

  GetAllDeliveryZones(): Observable<any> {
    return this._http.get(`${baseUrl}DeliveryZones`, {});
  }
}
