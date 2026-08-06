import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Config, ConfigService } from './config';
import { CartService, CartItem } from './cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ ConfigService ],
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  config?: Config;
  error: any;
  searchQuery: string = '';

  // Cart properties
  cartItems: CartItem[] = [];
  isCartOpen: boolean = false;
  isCheckoutOpen: boolean = false;
  isSuccessOpen: boolean = false;
  isSidebarOpen: boolean = false;
  totalAmount: number = 0;
  totalCount: number = 0;

  private subs: Subscription = new Subscription();

  constructor(
    private configService: ConfigService, 
    private cartService: CartService,
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

    // Subscribe to Cart Service state changes
    this.subs.add(
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
        this.totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
        this.totalAmount = items.reduce((acc, item) => {
          const price = typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price || '0');
          return acc + (price * item.quantity);
        }, 0);
        this.cdr.markForCheck();
      })
    );

    this.subs.add(
      this.cartService.isCartOpen$.subscribe(isOpen => {
        this.isCartOpen = isOpen;
        this.cdr.markForCheck();
      })
    );

    this.subs.add(
      this.cartService.isCheckoutOpen$.subscribe(isOpen => {
        this.isCheckoutOpen = isOpen;
        this.cdr.markForCheck();
      })
    );

    this.subs.add(
      this.cartService.isSuccessOpen$.subscribe(isOpen => {
        this.isSuccessOpen = isOpen;
        this.cdr.markForCheck();
      })
    );

    // Make addToCart available globally on window so legacy description clicks can add items!
    (window as any).addToCart = (productId: string | number) => {
      if (this.config && this.config.Products) {
        const prod = this.config.Products.find(p => String(p.productID) === String(productId));
        if (prod) {
          this.cartService.addToCart(prod);
        }
      }
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if ((window as any).addToCart) {
      delete (window as any).addToCart;
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.router.navigate(['/'], { queryParams: { search: value }, queryParamsHandling: 'merge' });
  }

  // Cart operations exposed to HTML template
  openCart(): void {
    this.cartService.openCart();
  }

  closeCart(): void {
    this.cartService.closeCart();
  }

  updateQty(productId: string | number | undefined, delta: number): void {
    if (productId !== undefined) {
      this.cartService.updateQty(productId, delta);
    }
  }

  removeFromCart(productId: string | number | undefined): void {
    if (productId !== undefined) {
      this.cartService.removeFromCart(productId);
    }
  }

  openCheckout(): void {
    this.cartService.openCheckout();
  }

  closeCheckout(): void {
    this.cartService.closeCheckout();
  }

  closeSuccess(): void {
    this.cartService.closeSuccess();
    this.cartService.closeAll();
  }

  closeAll(): void {
    this.cartService.closeAll();
  }

  submitOrder(event: Event): void {
    event.preventDefault();
    const formEl = event.target as HTMLFormElement;
    const formData = formEl ? new FormData(formEl) : null;

    const orderPayload = {
      domain: 'astoreforbeauty.com',
      name: formData ? (formData.get('name') || formData.get('fullName') || '') : '',
      email: formData ? (formData.get('email') || '') : '',
      phone: formData ? (formData.get('phone') || '') : '',
      address: formData ? (formData.get('address') || '') : '',
      city: formData ? (formData.get('city') || '') : '',
      zip: formData ? (formData.get('zip') || '') : '',
      items: this.cartItems.map(item => ({
        productID: item.product.productID || item.product.id,
        title: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      totalAmount: this.totalAmount
    };

    try {
      fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      }).catch(err => console.error('Error dispatching order to backend:', err));
    } catch (e) {
      console.error('Fetch error:', e);
    }

    this.cartService.clearCart();
    this.cartService.openSuccess();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.markForCheck();
  }

  title = 'AStoreForBeauty.com';
}
