import { IUserData } from './../../../core/Interfaces/IUser';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AddresService } from '../../../core/services/addres.service';
import { IAddress } from '../../../core/Interfaces/IAddress';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user.service';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [MenubarModule, RouterModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent implements OnInit {
  myallAddresses: IAddress[] = [];

  private destroyRef = inject(DestroyRef);

  user!: IUserData;

  constructor(
    private _message: MessagesService,
    private _address: AddresService,
    private _user: UserService,
  ) {}
  ngOnInit(): void {
    this.user = this._user.loadCurrentUser();
    this._address
      .GetAllAddresses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (req: any) => {
          console.log('get Adderess Successfully', req);
          let addresses = req.data;

          this.myallAddresses = addresses ? (addresses as IAddress[]) : [];
        },
        error: (err: any) => console.log('get Adderess Failed', err),
      });
  }

  setAsDefault(id: number) {
    // debugger;

    this._address.SetAddresDefault(id).subscribe({
      next: (req: any) => {
        console.log('Set Default Successfully', req);
        this.myallAddresses = this.myallAddresses.map((addr) => ({
          ...addr,
          active: addr.id === id,
        }));
        this._message.showSuccess('Address Default Successfully');
      },
      error: (err: any) => {
        console.log('Set Default Failed', err);
        this._message.showSuccess('Address Default Failed');
      },
    });
  }

  removeAddress(id: number) {
    this._address.RemoveAddress(id).subscribe({
      next: (req: any) => {
        console.log('Set Remove Successfully', req);

        this.myallAddresses = this.myallAddresses.filter((x) => x.id !== id);

        this._message.showSuccess('Address Removed Successfully');
      },
      error: (err: any) => {
        console.log('Set Remove Failed', err);
        this._message.showSuccess('Address Removed Failed');
      },
    });
  }
}
