import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee } from '../models/employees';

@Injectable({
  providedIn: 'root'
})
export class EmployeesAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/colaboradores/';
  }

  getList(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<Employee> {
    return this.http.get<Employee>(this.myAppUrl + this.myApiUrl + id);
  }

  post(employee: Employee | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, employee);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, employee: Employee | FormData): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, employee);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-colaboradores', {});
  }
} 