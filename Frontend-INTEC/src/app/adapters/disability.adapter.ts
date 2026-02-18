import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Disability } from '../models/disability';

@Injectable({
    providedIn: 'root'
})
export class DisabilityAdapterService {
    private apiUrl = `${environment.endpoint}api/incapacidades`;
    private http = inject(HttpClient);

    getList(): Observable<Disability[]> {
        return this.http.get<Disability[]>(this.apiUrl);
    }

    get(id: string): Observable<Disability> {
        return this.http.get<Disability>(`${this.apiUrl}/${id}`);
    }

    create(disability: Disability): Observable<Disability> {
        return this.http.post<Disability>(this.apiUrl, disability);
    }

    update(id: string, disability: Disability): Observable<Disability> {
        return this.http.put<Disability>(`${this.apiUrl}/${id}`, disability);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
