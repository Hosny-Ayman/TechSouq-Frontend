import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor(private primeMessageService: MessageService) {}

  showSuccess(message: string) {
    this.primeMessageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  showError(message: string) {
    this.primeMessageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  showWarning(message: string) {
    this.primeMessageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
    });
  }
}
