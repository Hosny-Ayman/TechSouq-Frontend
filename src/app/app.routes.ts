import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { guestGuard } from '../core/guards/guest-guard.guard';

export const routes: Routes = [
  // ==========================================
  // 1. الدخول الأساسي للموقع
  // ==========================================
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'Home',
  },

  // ==========================================
  // 2. الجزء الخاص بالزوار (Auth Layout)
  // اللي مش مسجل هيشوف الناف بار والفوتر بتاع الزوار
  // ==========================================
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (c) => c.AuthLayoutComponent,
      ),
    canActivate: [guestGuard], // 👈 السحر هنا: لو مسجل هيطرده لقسم الـ User
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
    ],
  },

  // ==========================================
  // 3. الجزء المحمي (User Layout)
  // اللي مسجل دخول هيشوف الناف بار والفوتر بتاع اليوزر
  // ==========================================
  {
    path: 'User',
    loadComponent: () =>
      import('./layouts/user-layout/user-layout.component').then(
        (c) => c.UserLayoutComponent,
      ),
    canActivate: [authGuard], // 👈 الجارد بتاعك بيقفل الجزء ده
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
    ],
  },

  {
    path: '**',
    redirectTo: 'Home',
    pathMatch: 'full',
  },
];
