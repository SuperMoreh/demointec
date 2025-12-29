import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmployeeDocument {
    id?: number;
    id_employee: string;
    document_type: string;
    document_path?: string;
    upload_date?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeDocumentsAdapterService {
    private myAppUrl: string;
    private http = inject(HttpClient);

    constructor() {
        this.myAppUrl = environment.endpoint;
    }

    getDocuments(employeeId: string): Observable<EmployeeDocument[]> {
        return this.http.get<EmployeeDocument[]>(`${this.myAppUrl}api/employee-documents/${employeeId}`);
    }

    saveDocument(docData: FormData): Observable<any> {
        return this.http.post(`${this.myAppUrl}api/employee-documents`, docData);
    }

    deleteDocument(id: number): Observable<any> {
        return this.http.delete(`${this.myAppUrl}api/employee-documents/${id}`);
    }
}
