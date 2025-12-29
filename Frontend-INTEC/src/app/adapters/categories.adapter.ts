import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/categories';

@Injectable({
  providedIn: 'root'
})
export class CategoriesAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/partidas/';
  }

  getList(): Observable<Category[]> {
    return this.http.get<Category[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<Category> {
    return this.http.get<Category>(this.myAppUrl + this.myApiUrl + id);
  }

  post(category: Category | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, category);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, category: Category | FormData): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, category);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-partidas', {});
  }
} 