import { Component, inject, PLATFORM_ID } from '@angular/core';
import { AuthFooterComponent } from '../../components/auth-footer/auth-footer.component';
import { MenubarModule } from 'primeng/menubar';
import { AuthNavComponent } from '../../components/auth-nav/auth-nav.component';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [AuthFooterComponent, MenubarModule, AuthNavComponent, RouterModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {
  platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);
}
