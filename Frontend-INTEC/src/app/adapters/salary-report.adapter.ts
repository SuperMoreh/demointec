import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SalaryReport } from '../models/salary-report';

@Injectable({
    providedIn: 'root'
})
export class SalaryReportAdapterService {
    private apiUrl = `${environment.endpoint}api/tabulador-sueldos`;
    private http = inject(HttpClient);

    getList(): Observable<SalaryReport[]> {
        return this.http.get<SalaryReport[]>(this.apiUrl);
    }
}
