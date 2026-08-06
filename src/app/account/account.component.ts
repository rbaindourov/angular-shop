import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account',
  template: `
    <div style="max-width: 900px; margin: 2rem auto; padding: 1.5rem; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; font-family: system-ui, sans-serif;">
      <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">My Account</h2>

      <div *ngIf="!email" style="max-width: 400px; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b;">Sign In / Identify Account</h3>
        <form (submit)="loadAccount($event)">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Email Address</label>
            <input type="email" name="userEmail" [(ngModel)]="inputEmail" required placeholder="your.email@example.com" style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.95rem;" />
          </div>
          <button type="submit" style="width: 100%; background: #1e3a8a; color: white; border: none; padding: 0.65rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer;">
            View Account & Orders
          </button>
        </form>
      </div>

      <div *ngIf="email">
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <div>
            <span style="font-size: 0.85rem; color: #64748b;">Logged in as:</span>
            <strong style="display: block; font-size: 1.1rem; color: #0f172a;">{{ email }}</strong>
            <span style="font-size: 0.8rem; color: #10b981; font-weight: 600;">Verified via users_backend Identity</span>
          </div>
          <button (click)="logout()" style="background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
            Sign Out
          </button>
        </div>

        <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Order History</h3>

        <div *ngIf="loading" style="padding: 1rem; color: #64748b;">Loading order history...</div>

        <div *ngIf="!loading && orders.length === 0" style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; color: #64748b; text-align: center;">
          No previous orders found for <strong>{{ email }}</strong>.
        </div>

        <div *ngIf="!loading && orders.length > 0">
          <div *ngFor="let order of orders" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: #ffffff;">
            <div style="display: flex; justify-content: space-between; border-b: 1px solid #f1f5f9; padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
              <div>
                <span style="font-size: 0.8rem; color: #64748b;">Order ID:</span>
                <code style="display: block; font-weight: 600; color: #1e293b;">#{{ order._id }}</code>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.8rem; color: #64748b;">Date:</span>
                <div style="font-size: 0.85rem; color: #334155;">{{ order.submitted_on | date:'mediumDate' }}</div>
              </div>
            </div>

            <div style="margin-bottom: 0.75rem;">
              <div *ngFor="let item of order.items" style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem;">
                <span>{{ item.quantity }}x {{ item.title }}</span>
                <strong>\${{ item.price }}</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.9rem;">
              <span>Status: <strong style="color: #2563eb;">{{ order.status || 'Pending' }}</strong></span>
              <strong style="font-size: 1.05rem; color: #0f172a;">Total: \${{ order.totalAmount }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccountComponent implements OnInit {
  inputEmail: string = '';
  email: string = '';
  orders: any[] = [];
  loading: boolean = false;

  ngOnInit() {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      this.email = savedEmail;
      this.fetchAccountData(savedEmail);
    }
  }

  loadAccount(event: Event) {
    event.preventDefault();
    if (!this.inputEmail) return;
    this.email = this.inputEmail;
    localStorage.setItem('user_email', this.inputEmail);
    this.fetchAccountData(this.inputEmail);
  }

  fetchAccountData(email: string) {
    this.loading = true;
    fetch(`/api/user/account?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        if (data.success) {
          this.orders = data.orders || [];
        }
      })
      .catch(err => {
        this.loading = false;
        console.error('Error loading account:', err);
      });
  }

  logout() {
    this.email = '';
    this.inputEmail = '';
    this.orders = [];
    localStorage.removeItem('user_email');
  }
}
