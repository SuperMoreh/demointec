import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para las matrices
export interface Activity {
    description: string;
    ejecuta: boolean;
    supervisa: boolean;
    autoriza: boolean;
    frecuencia: string;
}

export interface Responsibility {
    description: string;
    individual: boolean;
    compartida: boolean;
    puestos_involucrados: string;
}

export interface ChangeLogEntry {
    description: string;
    date: string;
    author: string;
}

export interface JobDescription {
    id?: number;
    // I. Información General
    job_title: string;
    department?: string;
    // II. Razón de Ser
    objective?: string;
    // III. Funciones Claves (JSON stringified arrays)
    activities_matrix?: string;
    responsibilities_matrix?: string;
    // IV. Relaciones Estratégicas
    internal_relations?: string;
    external_relations?: string;
    // V. Estructura Organizacional
    org_manager?: string;
    org_supervisor?: string;
    // VI. Características del Perfil
    profile_gender?: string;
    profile_age?: string;
    profile_marital_status?: string;
    profile_schedule?: string;
    profile_travel_availability?: string;
    profile_languages?: string;
    profile_extra_requirements?: string;
    // VII. Conocimientos y Habilidades
    education?: string;
    specialty?: string;
    experience?: string;
    technical_knowledge?: string;
    software?: string;
    equipment?: string;
    // VIII. Autorización y Control
    created_date?: string;
    created_by?: string;
    reviewed_by?: string;
    authorized_by?: string;
    change_log?: string;
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
