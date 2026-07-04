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
      }
      this.loading = false;
      this.cdr.markForCheck();
    }, error => {
      this.loading = false;
      console.error(error);
      this.cdr.markForCheck();
    });
  }
}
