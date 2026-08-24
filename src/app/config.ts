import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry, shareReplay, map } from 'rxjs/operators';

export interface Config {
  Categories: Category[];
  Products: Product[];
}

export interface Category {
  id: string | number;
  name: string;
  slug?: string;
  urlrw?: string;
  parent_id?: number;
}

export interface Product {
  id: string;
  productID?: string;
  name: string;
  price: number | string;
  cost?: number | string;
  description?: string;
  cat?: string;
  image?: string;
  large?: string;
  thumb?: string;
  slug?: string;
}


@Injectable()
export class ConfigService {
  configUrl = '/assets/config.json';

  constructor(private http: HttpClient) { }

  private cache$?: Observable<Config>;

  getConfig() {
    console.log('--getConfig--')
    if (!this.cache$) {
      this.cache$ = this.http.get<Config>(this.configUrl)
        .pipe(
          retry(3), // retry a failed request up to 3 times
          map(config => {
            if (config) {
              if (config.Categories) {
                config.Categories = config.Categories.map(c => {
                  if (!c.slug) {
                    c.slug = c.urlrw || String(c.id);
                  }
                  return c;
                });
              }
              if (config.Products) {
                config.Products = config.Products.map(p => {
                  if (!p.image && p.large) {
                    p.image = p.large.split('@')[0];
                  }
                  if (p.image && !p.image.startsWith('/') && !p.image.startsWith('http')) {
                    p.image = '/' + p.image;
                  }
                  if (p.large) {
                    p.large = p.large.split('@').map(img => {
                      if (img && !img.startsWith('/') && !img.startsWith('http')) {
                        return '/' + img;
                      }
                      return img;
                    }).join('@');
                  }
                  if (p.thumb && !p.thumb.startsWith('/') && !p.thumb.startsWith('http')) {
                    p.thumb = '/' + p.thumb;
                  }
                  return p;
                });
              }
            }
            return config;
          }),
          catchError(this.handleError), // then handle the error
          shareReplay(1)
        );
    }
    return this.cache$;
  }

  getConfig_1() {
    return this.http.get<Config>(this.configUrl);
  }

  getConfig_2() {
    // now returns an Observable of Config
    return this.http.get<Config>(this.configUrl);
  }

  getConfig_3() {
    return this.http.get<Config>(this.configUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getConfigResponse(): Observable<HttpResponse<Config>> {
    return this.http.get<Config>(
      this.configUrl, { observe: 'response' });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }

  makeIntentionalError() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.http.get('not/a/real/url')
      .pipe(
        catchError(this.handleError)
      );
  }

}
