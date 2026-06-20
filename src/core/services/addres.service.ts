import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAddress } from '../Interfaces/IAddress';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddresService {
  constructor(private _http: HttpClient) {}

  GetAllAddresses(): Observable<any> {
    return this._http.get(`${environment.apiUrl}Addresses/MyAddresses`);
  }

  AddAddress(address: IAddress): Observable<any> {
    return this._http.post(`${environment.apiUrl}Addresses/Create`, address);
  }

  SetAddresDefault(AddressId: number): Observable<any> {
    return this._http.put(`${environment.apiUrl}Addresses/${AddressId}`, {});
  }

  RemoveAddress(AddressId: number): Observable<any> {
    return this._http.delete(`${environment.apiUrl}Addresses/${AddressId}`, {});
  }

  GetAddress(addressId: number): Observable<any> {
    return this._http.get(`${environment.apiUrl}Addresses/${addressId}`, {});
  }

  UpdateAddress(address: IAddress): Observable<any> {
    return this._http.put(`${environment.apiUrl}Addresses/Update`, address);
  }

  GetOnlyDefaultAddress(): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}Addresses/GetOnlyDefaultAddress`,
      {},
    );
  }

  GetCityShippingCost(CityName?: string): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}Addresses/GetCityShippingCost`,
      {
        params: {
          CityName: CityName || '',
        },
      },
    );
  }
}
