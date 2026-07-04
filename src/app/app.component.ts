import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Config, ConfigService } from './config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ ConfigService ],
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  config?: Config;
  error: any;
  searchQuery: string = '';

  constructor(
    private configService: ConfigService, 
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.configService.getConfig()
      .subscribe(
        (data: Config) => {
          this.config = { ...data };
          this.cdr.markForCheck();
        }, 
        error => {
          this.error = error;
          this.cdr.markForCheck();
        }
      );

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.cdr.markForCheck();
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.router.navigate(['/'], { queryParams: { search: value }, queryParamsHandling: 'merge' });
  }
  
  title = 'AStoreForBeauty.com';
}
