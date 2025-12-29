import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToolsCatalog } from '../models/tools_catalog';

@Injectable({
  providedIn: 'root'
})
export class ToolsCatalogAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient); 
  roles: any;

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/herramientas/';
  }

  getList(): Observable<ToolsCatalog[]> {
    return this.http.get<ToolsCatalog[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<ToolsCatalog> {
    return this.http.get<ToolsCatalog>(this.myAppUrl + this.myApiUrl + id);
  }

  post(tool: ToolsCatalog | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, tool);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, tool: ToolsCatalog | FormData): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, tool);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-herramientas', {});
  }

}