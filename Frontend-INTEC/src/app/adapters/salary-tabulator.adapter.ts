import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SalaryTabulator } from '../models/salary-tabulator';

@Injectable({
    providedIn: 'root'
})
export class SalaryTabulatorAdapterService {
    private apiUrl = `${environment.endpoint}api/tabulador-general-sueldos`;
    private http = inject(HttpClient);

    getList(): Observable<SalaryTabulator[]> {
        return this.http.get<SalaryTabulator[]>(this.apiUrl);
    }

    get(id: number): Observable<SalaryTabulator> {
        return this.http.get<SalaryTabulator>(`${this.apiUrl}/${id}`);
    }

    create(data: SalaryTabulator): Observable<SalaryTabulator> {
        return this.http.post<SalaryTabulator>(this.apiUrl, data);
    }

    update(id: number, data: SalaryTabulator): Observable<SalaryTabulator> {
        return this.http.put<SalaryTabulator>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
