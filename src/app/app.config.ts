import { ApplicationConfig, PLATFORM_ID, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { MessageService } from 'primeng/api';
import { isPlatformBrowser } from '@angular/common';

import {
  SocialAuthServiceConfig,
  GoogleLoginProvider,
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    MessageService,
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    {
      provide: 'SocialAuthServiceConfig',
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);
        const isBrowser = isPlatformBrowser(platformId);

        if (isBrowser) {
          return {
            autoLogin: false,
            providers: [
              {
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider(
                  '686495575320-pbl37bfoma2rmpu8v5j4d9nvlgb33sop.apps.googleusercontent.com',
                ),
              },
            ],
            onError: (err: any) => {
              console.error('Google Auth Error:', err);
            },
          } as SocialAuthServiceConfig;
        }

        return {
          autoLogin: false,
          providers: [],
        } as SocialAuthServiceConfig;
      },
    },
  ],
};
