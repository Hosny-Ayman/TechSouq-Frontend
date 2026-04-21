import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-nav',
  standalone: true,
  imports: [
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './user-nav.component.html',
  styleUrl: './user-nav.component.css',
})
export class UserNavComponent {
  searchWord: string = '';

  constructor(
    private _Products: ProductsService,
    private _auth: AuthService,
  ) {}

  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: 'User/',
      },
      {
        label: 'Contact',
        icon: 'pi pi-phone',
        routerLink: '/Contact',
      },
      {
        label: 'About',
        icon: 'pi pi-info-circle',
        routerLink: '/About',
      },
      {
        label: 'LogOut',
        icon: 'pi pi-user',
        routerLink: '/Register',
      },
      {
        label: 'Cart',
        icon: 'pi pi-shopping-cart',
        routerLink: '/Cart',
      },
    ];
  }

  onSearch() {
    this._Products.changeSearchTerm(this.searchWord);
  }
  logout() {
    this._auth.logout().subscribe({
      next: (req: any) => {
        console.log('Logout success', req);
      },
      error: (err: any) => {
        console.log('Logout Failed', err);
      },
    });
  }
}
