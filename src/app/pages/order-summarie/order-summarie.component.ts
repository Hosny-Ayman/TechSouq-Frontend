import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common'; // ضفنا الـ DatePipe هنا
import { RouterModule } from '@angular/router';
import { IOrder } from '../../../core/Interfaces/IOrder';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-summarie',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, RouterModule], // ضفناه في الـ imports
  templateUrl: './order-summarie.component.html',
  styleUrl: './order-summarie.component.css',
})
export class OrderSummarieComponent implements OnInit {
  orders: IOrder[] = [];

  _Order = inject(OrderService);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this._Order.GetOrderSummary().subscribe({
      next: (req: any) => {
        this.orders = req.data as IOrder[];
      },
      error: (err: any) => {
        console.log('Failed To Get Orders', err);
      },
    });
  }

  formatOrderNumber(id: number): string {
    return `#TS-${100000 + id}`;
  }

  getPaymentMethod(paymentWayId: number): string {
    if (paymentWayId === 1) return 'Cash on Delivery (COD)';
    if (paymentWayId === 2) return 'Credit Card';
    return 'Unknown';
  }

  getProgressWidth(status: string): string {
    if (!status) return '0%';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'placed':
        return '15%';
      case 'processing':
        return '50%';
      case 'shipped':
        return '85%';
      case 'delivered':
        return '100%';
      default:
        return '0%';
    }
  }

  isStepCompleted(currentStatus: string, step: string): boolean {
    if (!currentStatus) return false;

    let normalizedCurrent =
      currentStatus.toLowerCase() === 'pending'
        ? 'placed'
        : currentStatus.toLowerCase();
    let normalizedStep =
      step.toLowerCase() === 'pending' ? 'placed' : step.toLowerCase();

    const normalStatuses = ['placed', 'processing', 'shipped', 'delivered'];
    const currentIndex = normalStatuses.indexOf(normalizedCurrent);
    const stepIndex = normalStatuses.indexOf(normalizedStep);

    return currentIndex >= stepIndex;
  }
}
