import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService, Product } from '../config';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  loading: boolean = true;
  images: string[] = [];
  activeImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.configService.getConfig().subscribe(data => {
      if (data && data.Products) {
        this.product = data.Products.find(p => p.id === id || String(p.productID) === String(id));
        if (this.product) {
          // Resolve images from large string
          if (this.product.large) {
            this.images = this.product.large.split('@');
          } else if (this.product.image) {
            this.images = [this.product.image];
          } else {
            this.images = [];
          }
          this.activeImage = this.images.length > 0 ? this.images[0] : '';
        }
      }
      this.loading = false;
      this.cdr.markForCheck();
    }, error => {
      this.loading = false;
      console.error(error);
      this.cdr.markForCheck();
    });
  }

  selectImage(img: string): void {
    this.activeImage = img;
    this.cdr.markForCheck();
  }

  addToBag(): void {
    if (this.product && this.product.productID) {
      if ((window as any).addToCart) {
        (window as any).addToCart(this.product.productID);
      } else {
        console.error('addToCart is not defined globally on window');
      }
    }
  }
}
