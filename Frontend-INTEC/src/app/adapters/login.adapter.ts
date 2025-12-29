import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/users';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient); 

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/login/';
  }

  login(email: string, password: string): Observable<any> {
    const url = this.myAppUrl + 'api/login';
    return this.http.post<any>(url, { email, password });
  }
}