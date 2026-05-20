import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AddresService } from '../../../core/services/addres.service';
import { MessagesService } from '../../../core/services/messages.service';
import { IAddress } from '../../../core/Interfaces/IAddress';
import { DeliveryZoneService } from '../../../core/services/delivery-zone.service';

@Component({
  selector: 'app-add-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageModule, RouterModule],
  templateUrl: './add-address.component.html',
  styleUrl: './add-address.component.css',
})
export class AddAddressComponent implements OnInit {
  addressId: number = 0;

  deliveryZones: any[] = [];

  ngOnInit(): void {
    this.loadDeliveryZones();
    this._Getrourer.paramMap.subscribe((params) => {
      this.addressId = Number(params.get('id'));

      if (this.addressId !== 0) {
        this._address.GetAddress(this.addressId).subscribe({
          next: (req: any) => {
            console.log('get address Sucessfully to Edit', req);
            this.addressForm.patchValue(req.data);
          },
          error: (err: any) => console.log('get address Failed to Edit', err),
        });
      }
    });
  }
  private _Getrourer = inject(ActivatedRoute);
  private _fb = inject(FormBuilder);
  private _addressService = inject(AddresService);
  private _message = inject(MessagesService);
  private _router = inject(Router);
  private _address = inject(AddresService);

  private _deliveryZoneService = inject(DeliveryZoneService);

  addressForm: FormGroup = this._fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    country: ['Egypt', Validators.required],
    street: ['', Validators.required],
    building: [''],
    city: ['', Validators.required],
    phone: [
      '',
      [Validators.required, Validators.pattern('^01[0125][0-9]{8}$')],
    ],
    email: ['', [Validators.required, Validators.email]],
  });

  loadDeliveryZones() {
    this._deliveryZoneService.GetAllDeliveryZones().subscribe({
      next: (req: any) => {
        this.deliveryZones = req.data;
      },
      error: (err: any) => console.log('Error loading delivery zones', err),
    });
  }

  get f() {
    return this.addressForm.controls;
  }

  submitAddress() {
    if (this.addressForm.valid) {
      if (this.addressId === 0) {
        this._addressService.AddAddress(this.addressForm.value).subscribe({
          next: (res) => {
            this._message.showSuccess('Address added successfully!');
            this._router.navigate(['/User/Profile/Address']);
            console.log('Address added successfully!');
          },
          error: (err) => {
            this._message.showError(`${err.message}`);
            console.log('Address added Failed!');
          },
        });
      } else {
        let add = this.addressForm.value as IAddress;
        add.id = this.addressId;
        this._addressService.UpdateAddress(add).subscribe({
          next: (res) => {
            this._message.showSuccess('Address Update successfully!');
            this._router.navigate(['/User/Profile/Address']);
          },
          error: (err) => {
            this._message.showError('Address Update Failed!');
            console.log('Address Update Failed!');
          },
        });
      }
    } else {
      this.addressForm.markAllAsTouched();
    }
  }
}
