import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './config';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  private isCartOpen = new BehaviorSubject<boolean>(false);
  isCartOpen$ = this.isCartOpen.asObservable();

  private isCheckoutOpen = new BehaviorSubject<boolean>(false);
  isCheckoutOpen$ = this.isCheckoutOpen.asObservable();

  private isSuccessOpen = new BehaviorSubject<boolean>(false);
  isSuccessOpen$ = this.isSuccessOpen.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('astore_cart');
    if (savedCart) {
      try {
        this.cartItems.next(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart', e);
      }
    }
  }

  private saveCart(items: CartItem[]): void {
    this.cartItems.next(items);
    localStorage.setItem('astore_cart', JSON.stringify(items));
  }

  addToCart(product: Product): void {
    const current = this.cartItems.value;
    const existing = current.find(item => String(item.product.productID) === String(product.productID));
    
    if (existing) {
      existing.quantity += 1;
      this.saveCart([...current]);
    } else {
      this.saveCart([...current, { product, quantity: 1 }]);
    }
    
    this.openCart();
  }

  updateQty(productId: string | number, delta: number): void {
    const current = this.cartItems.value;
    const item = current.find(item => String(item.product.productID) === String(productId));
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.saveCart(current.filter(item => String(item.product.productID) !== String(productId)));
    } else {
      this.saveCart([...current]);
    }
  }

  removeFromCart(productId: string | number): void {
    const current = this.cartItems.value;
    this.saveCart(current.filter(item => String(item.product.productID) !== String(productId)));
  }

  clearCart(): void {
    this.saveCart([]);
  }

  openCart(): void {
    this.isCartOpen.next(true);
    this.isCheckoutOpen.next(false);
    this.isSuccessOpen.next(false);
  }

  closeCart(): void {
    this.isCartOpen.next(false);
  }

  openCheckout(): void {
    if (this.cartItems.value.length === 0) return;
    this.isCartOpen.next(false);
    this.isCheckoutOpen.next(true);
  }

  closeCheckout(): void {
    this.isCheckoutOpen.next(false);
  }

  openSuccess(): void {
    this.isCheckoutOpen.next(false);
    this.isSuccessOpen.next(true);
  }

  closeSuccess(): void {
    this.isSuccessOpen.next(false);
  }

  closeAll(): void {
    this.isCartOpen.next(false);
    this.isCheckoutOpen.next(false);
    this.isSuccessOpen.next(false);
  }
}
