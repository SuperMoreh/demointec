import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryExtintor } from '../models/inventory-extintor';

@Injectable({
  providedIn: 'root'
})
export class InventoryExtintorAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/inventario-rh-extintores/';
  }

  getList(): Observable<InventoryExtintor[]> {
    return this.http.get<InventoryExtintor[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: number): Observable<InventoryExtintor> {
    return this.http.get<InventoryExtintor>(this.myAppUrl + this.myApiUrl + id);
  }

  post(extintor: InventoryExtintor): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, extintor);
  }

  put(id: number, extintor: InventoryExtintor): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, extintor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
