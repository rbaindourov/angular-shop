import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config, ConfigService, Product } from '../config';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  config?: Config;
  filteredProducts: Product[] = [];
  activeCategoryName: string = 'Timeless Luxury & Style';
  activeCategoryDesc: string = 'Discover our curated collection of handcrafted sterling silver, fashion accessories, and premium skincare products.';

  constructor(
    private configService: ConfigService, 
    private cartService: CartService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.configService.getConfig().subscribe(data => {
      this.config = data;
      this.filterProducts();
    });

    // Listen to parameter changes (category slug)
    this.route.paramMap.subscribe(() => {
      this.filterProducts();
    });

    // Listen to query parameters (search query)
    this.route.queryParams.subscribe(() => {
      this.filterProducts();
    });
  }

  filterProducts(): void {
    if (!this.config) return;

    const slug = this.route.snapshot.paramMap.get('slug');
    const search = this.route.snapshot.queryParams['search'];
    
    let list = this.config.Products || [];

    // 1. Filter by Category Slug
    if (slug) {
      const category = this.config.Categories.find(c => String(c.slug) === String(slug) || String(c.id) === String(slug));
      if (category) {
        list = list.filter(p => String(p.cat) === String(category.id));
        this.activeCategoryName = category.name;
        this.activeCategoryDesc = `Browse our exclusive select range of premium ${category.name.toLowerCase()} products selected just for you.`;
      }
    } else {
      this.activeCategoryName = 'Timeless Luxury & Style';
      this.activeCategoryDesc = 'Discover our curated collection of handcrafted sterling silver, fashion accessories, and premium skincare products.';
    }

    // 2. Filter by Search Query
    if (search && String(search).trim() !== '') {
      const q = String(search).toLowerCase();
      list = list.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) || 
          (p.description && p.description.toLowerCase().includes(q))
      );
      if (!slug) {
        this.activeCategoryName = `Search Results: "${search}"`;
        this.activeCategoryDesc = `Found ${list.length} products matching your keywords.`;
      }
    }

    this.filteredProducts = list;
    this.cdr.markForCheck();
  }

  addToBag(product: Product): void {
    this.cartService.addToCart(product);
  }
}
