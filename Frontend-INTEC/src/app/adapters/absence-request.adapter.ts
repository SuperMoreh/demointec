import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AbsenceRequest } from '../models/absence-request';

@Injectable({
    providedIn: 'root'
})
export class AbsenceRequestAdapterService {
    private apiUrl = `${environment.endpoint}api/solicitudes-ausencia`;
    private http = inject(HttpClient);

    getList(): Observable<AbsenceRequest[]> {
        return this.http.get<AbsenceRequest[]>(this.apiUrl);
    }

    get(id: string): Observable<AbsenceRequest> {
        return this.http.get<AbsenceRequest>(`${this.apiUrl}/${id}`);
    }

    getByEmployee(idEmployee: string): Observable<AbsenceRequest[]> {
        return this.http.get<AbsenceRequest[]>(`${this.apiUrl}/employee/${idEmployee}`);
    }

    create(request: AbsenceRequest): Observable<AbsenceRequest> {
        return this.http.post<AbsenceRequest>(this.apiUrl, request);
    }

    update(id: string, request: AbsenceRequest): Observable<AbsenceRequest> {
        return this.http.put<AbsenceRequest>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
