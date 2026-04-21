export interface IProducts {
  data: ProductsResponse;
}

export interface ProductsResponse {
  data: Product[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
  firstImage: string;
  categoryName: string;
  brandName: string;
}
