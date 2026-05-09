export interface ICartItems {
  quantity: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  subtotal?: number;
  stock: number;
}

export interface ICartItemsAndProductsDetails {
  cartId?: number;
  cartItemId?: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Items {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
}
