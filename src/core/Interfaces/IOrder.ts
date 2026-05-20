export interface IOrder {
  id: number;
  date: Date;
  status: string;
  deliveryAddress: string;
  paymentWayId: number;
  subtotal: number;
  deliveryCost: number;
  discountAmount: number;
  totalAmount: number;
  items: IItems[];
}

export interface IItems {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}
