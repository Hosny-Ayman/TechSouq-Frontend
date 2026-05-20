export interface Review {
  id: number;
  rating: number;
  comment: string;
  productId: number;
  updatedAt?: Date;
  userFullName?: string;
  createdAt?: Date;
}
