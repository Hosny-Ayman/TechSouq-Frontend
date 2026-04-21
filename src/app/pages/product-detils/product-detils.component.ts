import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // 👈 ده اللي بيقرا اللينك
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/Interfaces/IProducts';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-detils',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detils.component.html',
  styleUrl: './product-detils.component.css',
})
export class ProductDetilsComponent implements OnInit {
  ProductId!: number;
  ProductDetails!: Product;

  selectedImage: string = '';
  quantity: number = 1;

  constructor(
    private _Products: ProductsService,
    private _rourer: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this._rourer.paramMap.subscribe((params) => {
      this.ProductId = Number(params.get('id'));

      if (this.ProductId) this.fetchProductData();
    });
  }

  fetchProductData() {
    this._Products.GetProductById(this.ProductId).subscribe({
      next: (res: any) => {
        this.ProductDetails = res.data;
        console.log(res);
        if (this.ProductDetails.images?.length > 0) {
          this.selectedImage = this.ProductDetails.images[0];
        }
      },
    });
  }

  changeImage(img: string) {
    this.selectedImage = img;
  }

  updateQuantity(amount: number) {
    if (this.quantity + amount >= 1) {
      this.quantity += amount;
    }
  }
}
