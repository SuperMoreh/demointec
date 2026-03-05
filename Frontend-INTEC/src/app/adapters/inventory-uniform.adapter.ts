import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryUniform } from '../models/inventory-uniform';

@Injectable({
  providedIn: 'root'
})
export class InventoryUniformAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/inventario-rh-uniformes/';
  }

  getList(): Observable<InventoryUniform[]> {
    return this.http.get<InventoryUniform[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: number): Observable<InventoryUniform> {
    return this.http.get<InventoryUniform>(this.myAppUrl + this.myApiUrl + id);
  }

  post(uniform: InventoryUniform): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, uniform);
  }

  put(id: number, uniform: InventoryUniform): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, uniform);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
