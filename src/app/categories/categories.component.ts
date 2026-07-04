import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../config';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnChanges {
  @Input() categories?: Category[] = [];
  sortedCategories: Category[] = [];
  activeCategoryId?: string;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.activeCategoryId = params['category'];
    });
  }

  ngOnChanges(): void {
    if (this.categories) {
      // Sort alphabetically by category name
      this.sortedCategories = [...this.categories].sort((a, b) => 
        String(a.name).localeCompare(String(b.name))
      );
    } else {
      this.sortedCategories = [];
    }
  }

  selectCategory(catId: any): void {
    const id = String(catId);
    // Keep existing query params except search if they click a new category
    this.router.navigate(['/'], { queryParams: { category: id }, queryParamsHandling: 'merge' });
  }
}
