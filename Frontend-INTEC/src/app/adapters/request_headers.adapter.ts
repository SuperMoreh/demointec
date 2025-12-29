import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestHeaders } from '../models/request_headers';

@Injectable({
  providedIn: 'root'
})
export class RequestHeadersAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/solicitudesEncabezado/';
  }

  getList(): Observable<RequestHeaders[]> {
    return this.http.get<RequestHeaders[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<RequestHeaders> {
    return this.http.get<RequestHeaders>(this.myAppUrl + this.myApiUrl + id);
  }

  post(requestHeader: RequestHeaders | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, requestHeader);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, requestHeader: RequestHeaders | FormData | RequestHeaders[]): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, requestHeader);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-solicitudesEncabezado', {});
  }
} 