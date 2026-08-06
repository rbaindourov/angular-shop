import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';

import { AccountComponent } from './account/account.component';

const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'account', component: AccountComponent },
  { path: 'category/:slug', component: ProductListComponent },
  { path: 'category-:slug', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  { path: 'product-:id', component: ProductDetailsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
