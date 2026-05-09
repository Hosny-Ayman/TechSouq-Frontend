import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAddress } from '../Interfaces/IAddress';
import { Observable } from 'rxjs';
import { baseUrl } from '../apiRoot/baseUrl';

@Injectable({
  providedIn: 'root',
})
export class AddresService {
  constructor(private _http: HttpClient) {}

  GetAllAddresses(): Observable<any> {
    return this._http.get(`${baseUrl}Addresses/MyAddresses`);
  }

  AddAddress(address: IAddress): Observable<any> {
    return this._http.post(`${baseUrl}Addresses/Create`, address);
  }

  SetAddresDefault(AddressId: number): Observable<any> {
    return this._http.put(`${baseUrl}Addresses/${AddressId}`, {});
  }

  RemoveAddress(AddressId: number): Observable<any> {
    return this._http.delete(`${baseUrl}Addresses/${AddressId}`, {});
  }

  GetAddress(addressId: number): Observable<any> {
    return this._http.get(`${baseUrl}Addresses/${addressId}`, {});
  }

  UpdateAddress(address: IAddress): Observable<any> {
    return this._http.put(`${baseUrl}Addresses/Update`, address);
  }
}
