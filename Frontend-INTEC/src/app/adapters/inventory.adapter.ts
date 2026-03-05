import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inventory } from '../models/inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/inventario-rh/';
  }

  getList(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<Inventory> {
    return this.http.get<Inventory>(this.myAppUrl + this.myApiUrl + id);
  }

  post(inventory: Inventory): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, inventory);
  }

  put(id: string, inventory: Inventory): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, inventory);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
