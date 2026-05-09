import { Injectable } from '@angular/core';
import { IUserData } from '../Interfaces/IUser';
import { Observable } from 'rxjs';
import { UtilityService } from './utility.service';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../apiRoot/baseUrl';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private _utility: UtilityService,
    private _http: HttpClient,
  ) {}

  loadCurrentUser(): IUserData {
    const user = this._utility.getStorageItem('userData');

    if (user === null) {
      return {
        id: 0,
        firstName: '',
        secondName: '',
        email: '',
        roleId: 0,
        oldPassword: '',
        newPassword: '',
      };
    }
    return user;
  }

  updateUser(userData: IUserData): Observable<any> {
    return this._http.put(`${baseUrl}Users/Update`, userData);
  }
}
