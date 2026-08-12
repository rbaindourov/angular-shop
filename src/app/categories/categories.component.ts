import { Component, Input, OnChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Category, Product } from '../config';

interface GroupedCategory {
  parent: Category;
  children: Category[];
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnChanges {
  @Input() categories?: Category[] = [];
  @Input() products?: Product[] = [];
  
  groupedCategories: GroupedCategory[] = [];
  standaloneCategories: Category[] = [];
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
    this.groupCategories();
  }

  groupCategories(): void {
    if (!this.categories || !this.products) {
      this.groupedCategories = [];
      this.standaloneCategories = [];
      return;
    }

    const cats = this.categories;
    const prods = this.products;

    // Filter top-level categories (parent_id = 0 or undefined)
    const topLevel = cats.filter(c => !c.parent_id || c.parent_id === 0);

    const newGrouped: GroupedCategory[] = [];
    const newStandalone: Category[] = [];

    topLevel.forEach(parent => {
      const children = cats.filter(child => child.parent_id === parent.id);
      
      // Filter out empty subcategories
      const nonEmptyChildren = children.filter(child => 
        prods.some(p => String(p.cat) === String(child.id))
      ).sort((a, b) => String(a.name).localeCompare(String(b.name)));

      if (nonEmptyChildren.length > 0) {
        newGrouped.push({
          parent,
          children: nonEmptyChildren
        });
      } else {
        const hasDirectProducts = prods.some(p => String(p.cat) === String(parent.id));
        if (hasDirectProducts) {
          newStandalone.push(parent);
        }
      }
    });

    this.groupedCategories = newGrouped;
    this.standaloneCategories = newStandalone.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    this.cdr.markForCheck();
  }
}
