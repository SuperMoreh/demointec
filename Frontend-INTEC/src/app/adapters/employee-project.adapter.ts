import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmployeeProject } from '../models/employee-project';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProjectAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/colaborador-obra/';
  }

  getList(): Observable<EmployeeProject[]> {
    return this.http.get<EmployeeProject[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<EmployeeProject> {
    return this.http.get<EmployeeProject>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, data: EmployeeProject): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
