import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  setStorageItem(key: string, value: any): void {
    if (this.isBrowser) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  getStorageItem(key: string): any {
    if (this.isBrowser) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  removeStorageItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  getImageUrl(fileName: string, imagePath: string): string {
    if (!imagePath)
      return 'https://placehold.co/150x150/292929/FFF?text=No+Image';

    if (imagePath.startsWith('http')) return imagePath;

    const Image = imagePath.split('/').pop();

    return 'https://localhost:7180/' + fileName + '/' + Image;
  }
}
