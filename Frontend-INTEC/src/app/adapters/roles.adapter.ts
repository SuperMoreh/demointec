import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/roles';

@Injectable({
  providedIn: 'root'
})
export class RoleAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient); 

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/roles/';
  }

  getList(): Observable<Role[]> {
    return this.http.get<Role[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: number): Observable<Role> {
    return this.http.get<Role>(this.myAppUrl + this.myApiUrl + id);
  }

  post(role: Role): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: number, role: Role): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, role);
  }


}