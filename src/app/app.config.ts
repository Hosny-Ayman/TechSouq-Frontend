import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // تأكد إن المسار ده صح

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(), // يفضل تسيبها شغالة عشان الـ SSR يشتغل صح
    provideAnimations(),
    MessageService,

    // 👇 التعديل كله هنا: دمجناهم مع بعض
    provideHttpClient(
      withFetch(), // عشان التحذير بتاع الفيتش
      withInterceptors([authInterceptor]), // عشان نشغل الانترسبتور
    ),
  ],
};
