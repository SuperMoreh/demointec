import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface JobDescription {
    id?: number;
    job_title: string;
    immediate_boss?: string;
    subordinates?: string;
    basic_function?: string;
    responsibility_level?: string;
    employment_type?: string;
    shift?: string;
    schedule_mon_fri?: string;
    schedule_weekend?: string;
    decision_making?: string;
    general_objective?: string;
    functions?: string;
    tasks?: string;
    required_documents?: string;
    status?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class JobDescriptionAdapterService {
    private myAppUrl: string;
    private http = inject(HttpClient);

    constructor() {
        this.myAppUrl = environment.endpoint;
    }

    getAll(): Observable<JobDescription[]> {
        return this.http.get<JobDescription[]>(`${this.myAppUrl}api/job-descriptions`);
    }

    getById(id: number): Observable<JobDescription> {
        return this.http.get<JobDescription>(`${this.myAppUrl}api/job-descriptions/${id}`);
    }

    create(data: JobDescription): Observable<JobDescription> {
        return this.http.post<JobDescription>(`${this.myAppUrl}api/job-descriptions`, data);
    }

    update(id: number, data: JobDescription): Observable<JobDescription> {
        return this.http.put<JobDescription>(`${this.myAppUrl}api/job-descriptions/${id}`, data);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.myAppUrl}api/job-descriptions/${id}`);
    }

    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.myAppUrl}api/uploads`, formData);
    }
}
