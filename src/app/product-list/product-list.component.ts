import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Config, ConfigService } from '../config';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  config?: Config;

  constructor(private configService: ConfigService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.configService.getConfig().subscribe(data => {
      this.config = data;
      this.cdr.markForCheck();
    });
  }

}
