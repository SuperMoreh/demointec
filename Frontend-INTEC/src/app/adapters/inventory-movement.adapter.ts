import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryMovement } from '../models/inventory-movement';

@Injectable({
  providedIn: 'root'
})
export class InventoryMovementAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/inventario-rh-movimientos/';
  }

  getList(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(this.myAppUrl + this.myApiUrl);
  }

  getListByInventory(id_inventory: string): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(this.myAppUrl + this.myApiUrl + 'articulo/' + id_inventory);
  }

  get(id: number): Observable<InventoryMovement> {
    return this.http.get<InventoryMovement>(this.myAppUrl + this.myApiUrl + id);
  }

  post(movement: InventoryMovement): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, movement);
  }
}
