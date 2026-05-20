export interface ConfirmOrder {
  code?: string;
  shippingStreet: string;
  shippingCity: string;
  email: string;
  building: string;
  country: string;
  phone: string;
  shippingFullName: string;
  paymentWayId: number;
}
