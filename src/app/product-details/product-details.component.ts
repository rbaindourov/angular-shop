import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private router: Router,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadProduct(id);
    });
  }

  loadProduct(id: string | null): void {
    this.loading = true;
    this.cdr.markForCheck();
    
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

  onDescriptionClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        // 1. Intercept legacy product links
        const prodMatch = href.match(/product_detail\.php\?id=(\d+)/);
        if (prodMatch) {
          event.preventDefault();
          const productId = prodMatch[1];
          this.router.navigate(['/product', productId]);
          return;
        }

        // 2. Intercept legacy category links
        const catMatch = href.match(/products\.php\?cat=(\d+)/);
        if (catMatch) {
          event.preventDefault();
          const catId = catMatch[1];
          this.configService.getConfig().subscribe(config => {
            if (config && config.Categories) {
              const category = config.Categories.find(c => String(c.id) === String(catId));
              if (category && category.slug) {
                this.router.navigate(['/category', category.slug]);
              } else {
                this.router.navigate(['/category', catId]);
              }
            }
          });
        }
      }
    }
  }
}
