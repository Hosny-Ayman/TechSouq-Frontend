import { Component, inject, PLATFORM_ID } from '@angular/core';
import { UserNavComponent } from '../../components/user-nav/user-nav.component';
import { MenubarModule } from 'primeng/menubar';
import { UserFooterComponent } from '../../components/user-footer/user-footer.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [UserNavComponent, MenubarModule, UserFooterComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css',
})
export class UserLayoutComponent {
  platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);
}
