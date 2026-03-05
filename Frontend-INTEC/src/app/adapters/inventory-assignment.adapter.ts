import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryAssignment } from '../models/inventory-assignment';

@Injectable({
  providedIn: 'root'
})
export class InventoryAssignmentAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/inventario-rh-asignaciones/';
  }

  getList(): Observable<InventoryAssignment[]> {
    return this.http.get<InventoryAssignment[]>(this.myAppUrl + this.myApiUrl);
  }

  getListByInventory(id_inventory: string): Observable<InventoryAssignment[]> {
    return this.http.get<InventoryAssignment[]>(this.myAppUrl + this.myApiUrl + 'articulo/' + id_inventory);
  }

  getListByEmployee(id_employee: string): Observable<InventoryAssignment[]> {
    return this.http.get<InventoryAssignment[]>(this.myAppUrl + this.myApiUrl + 'colaborador/' + id_employee);
  }

  get(id: number): Observable<InventoryAssignment> {
    return this.http.get<InventoryAssignment>(this.myAppUrl + this.myApiUrl + id);
  }

  post(assignment: InventoryAssignment): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, assignment);
  }

  put(id: number, assignment: InventoryAssignment): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, assignment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
