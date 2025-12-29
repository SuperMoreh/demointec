import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../models/projects_catalog';

@Injectable({
  providedIn: 'root'
})
export class ProjectsCatalogAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/obras/';
  }

  getList(): Observable<Project[]> {
    return this.http.get<Project[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<Project> {
    return this.http.get<Project>(this.myAppUrl + this.myApiUrl + id);
  }

  post(project: Project | FormData): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, project);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }

  put(id: string, project: Project | FormData): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, project);
  }

  syncToFirebase(): Observable<any> {
    return this.http.post(this.myAppUrl + 'api/sincronizar-obras', {});
  }
} 