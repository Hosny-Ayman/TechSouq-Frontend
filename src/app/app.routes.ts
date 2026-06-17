import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { guestGuard } from '../core/guards/guest-guard.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'Home',
  },

  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (c) => c.AuthLayoutComponent,
      ),
    canActivate: [guestGuard],
    children: [
      {
        path: 'Home',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./pages/product-detils/product-detils.component').then(
            (c) => c.ProductDetilsComponent,
          ),
      },
      {
        path: 'Login',
        loadComponent: () =>
          import('./pages/login/login.component').then((c) => c.LoginComponent),
      },
      {
        path: 'Register',
        loadComponent: () =>
          import('./pages/register/register.component').then(
            (c) => c.RegisterComponent,
          ),
      },
      {
        path: 'Cart',
        loadComponent: () =>
          import('./pages/cart/cart/cart.component').then(
            (c) => c.CartComponent,
          ),
      },
      {
        path: 'ForgetPassword',
        loadComponent: () =>
          import('./components/forget-password/forget-password.component').then(
            (c) => c.ForgetPasswordComponent,
          ),
      },

      {
        path: 'Reset-Password',
        loadComponent: () =>
          import('./components/reset-password/reset-password.component').then(
            (c) => c.ResetPasswordComponent,
          ),
      },

      {
        path: 'Contact',
        loadComponent: () =>
          import('./pages/contact/contact.component').then(
            (c) => c.ContactComponent,
          ),
      },

      {
        path: 'About',
        loadComponent: () =>
          import('./pages/about/about.component').then((c) => c.AboutComponent),
      },
    ],
  },

  {
    path: 'User',
    loadComponent: () =>
      import('./layouts/user-layout/user-layout.component').then(
        (c) => c.UserLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'Home',
        pathMatch: 'full',
      },
      {
        path: 'Home',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./pages/product-detils/product-detils.component').then(
            (c) => c.ProductDetilsComponent,
          ),
      },
      {
        path: 'Cart',
        loadComponent: () =>
          import('./pages/cart/cart/cart.component').then(
            (c) => c.CartComponent,
          ),
      },
      {
        path: 'Payment',
        loadComponent: () =>
          import('./components/payment/payment.component').then(
            (c) => c.PaymentComponent,
          ),
      },
      {
        path: 'Profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (c) => c.ProfileComponent,
          ),
        children: [
          { path: '', redirectTo: 'MyProfile', pathMatch: 'full' },
          {
            path: 'MyProfile',
            loadComponent: () =>
              import('./components/my-profile/my-profile.component').then(
                (c) => c.MyProfileComponent,
              ),
          },
          {
            path: 'Address',
            loadComponent: () =>
              import('./components/address/address.component').then(
                (c) => c.AddressComponent,
              ),
          },

          {
            path: 'AddAddress/:id',
            loadComponent: () =>
              import('./components/add-address/add-address.component').then(
                (c) => c.AddAddressComponent,
              ),
          },
        ],
      },
      {
        path: 'Order',
        loadComponent: () =>
          import('./pages/order-summarie/order-summarie.component').then(
            (c) => c.OrderSummarieComponent,
          ),
      },
      {
        path: 'Contact',
        loadComponent: () =>
          import('./pages/contact/contact.component').then(
            (c) => c.ContactComponent,
          ),
      },
      {
        path: 'About',
        loadComponent: () =>
          import('./pages/about/about.component').then((c) => c.AboutComponent),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'Home',
    pathMatch: 'full',
  },
];
