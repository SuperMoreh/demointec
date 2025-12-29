import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MaterialsCatalog } from '../models/materials_catalog';

@Injectable({
  providedIn: 'root'
})
export class MaterialsCatalogAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/materiales/';
  }

  getList(): Observable<MaterialsCatalog[]> {
    return this.http.get<MaterialsCatalog[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<MaterialsCatalog> {
    return this.http.get<MaterialsCatalog>(this.myAppUrl + this.myApiUrl + id);
  }

  post(material: MaterialsCatalog | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, material);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, material: MaterialsCatalog | FormData): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, material);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-materiales', {});
  }
} 