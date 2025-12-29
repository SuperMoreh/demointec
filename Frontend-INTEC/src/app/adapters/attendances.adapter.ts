import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Attendance } from '../models/attendances';

@Injectable({
  providedIn: 'root'
})
export class AttendancesAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/asistencias/';
  }

  getList(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<Attendance> {
    return this.http.get<Attendance>(this.myAppUrl + this.myApiUrl + id);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-asistencias', {});
  }

  getByDateRange(uuid: string, startDate: string, endDate: string): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(this.myAppUrl + this.myApiUrl + 'rango', { uuid, startDate, endDate });
  }
} 