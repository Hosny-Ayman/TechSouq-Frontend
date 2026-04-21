import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-nav',
  standalone: true,
  imports: [
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './auth-nav.component.html',
  styleUrl: './auth-nav.component.css',
})
export class AuthNavComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/Home',
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
        label: 'Sign Up',
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
}
