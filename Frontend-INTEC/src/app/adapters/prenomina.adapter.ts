import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Prenomina } from '../models/prenomina';

@Injectable({
  providedIn: 'root'
})
export class PrenominaAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/prenomina/';
  }

  getList(startDate: string, endDate: string): Observable<Prenomina[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Prenomina[]>(this.myAppUrl + this.myApiUrl, { params });
  }
}
