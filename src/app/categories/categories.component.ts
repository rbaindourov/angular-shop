import { Component, Input, OnChanges, OnInit, ChangeDetectorRef } from '@angular/core';
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
  activeCategorySlug?: string;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      let active = this.route.root;
      while (active.firstChild) {
        active = active.firstChild;
      }
      active.paramMap.subscribe(params => {
        this.activeCategorySlug = params.get('slug') || undefined;
        this.cdr.markForCheck();
      });
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
}
