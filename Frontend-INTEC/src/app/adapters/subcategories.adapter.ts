import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Subcategory } from '../models/subcategories';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriesAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/subpartidas/';
  }

  getList(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<Subcategory> {
    return this.http.get<Subcategory>(this.myAppUrl + this.myApiUrl + id);
  }

  post(subcategory: Subcategory | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, subcategory);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, subcategory: Subcategory | FormData): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, subcategory);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-subpartidas', {});
  }
} 