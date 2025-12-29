import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestDetails } from '../models/request_details';

@Injectable({
  providedIn: 'root'
})
export class RequestDetailsAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/solicitudesDetalle/';
  }

  getList(): Observable<RequestDetails[]> {
    return this.http.get<RequestDetails[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<RequestDetails> {
    return this.http.get<RequestDetails>(this.myAppUrl + this.myApiUrl + id);
  }

  post(requestDetail: RequestDetails | RequestDetails[] | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, requestDetail);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, requestDetail: RequestDetails | RequestDetails[] | FormData): Observable<void> {
    if (id === 'update' && Array.isArray(requestDetail) && requestDetail.length > 0) {
      const firstDetail = requestDetail[0] as RequestDetails;
      const urlId = firstDetail.id_detail || firstDetail.id || 'bulk';
      const fullUrl = this.myAppUrl + this.myApiUrl + urlId;
      
      
      return this.http.put<any>(fullUrl, requestDetail);
    }
    // Para actualizaciones individuales, usar el id en la URL
    const fullUrl = this.myAppUrl + this.myApiUrl + id;
    return this.http.put<void>(fullUrl, requestDetail);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-solicitudesDetalle', {});
  }

  getCurrentFolio(): Observable<{ folio: number }> {
    return this.http.get<{ folio: number }>(this.myAppUrl + this.myApiUrl + 'folio');
  }
} 