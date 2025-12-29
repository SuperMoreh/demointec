import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/users';
import { environment } from '../../environments/environment';
import { Role } from '../models/roles';

@Injectable({
  providedIn: 'root'
})
export class UserAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient); 
  roles: any;

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/usuarios/';
  }

  getList(): Observable<User[]> {
    return this.http.get<User[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(this.myAppUrl + this.myApiUrl + id);
  }

  post(userFormData: FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, userFormData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: number, user: FormData | any): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, user);
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find((role: Role) => role.id_role === roleId);
    return role ? role.name_role : 'Sin rol';
  }


}