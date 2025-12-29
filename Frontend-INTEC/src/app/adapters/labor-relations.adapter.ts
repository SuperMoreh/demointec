import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LaborEvent {
    id?: number;
    id_employee: string;
    event_date: string;
    event_name: string;
    observation?: string;
    document_path?: string;
    created_at?: string;
}

export interface EmployeeUniform {
    id?: number;
    id_employee: string;
    vest_type?: string;
    helmet_color?: string;
    glasses?: boolean;
    gloves_type?: string;
    earplugs?: boolean;
    boots_size?: string;
    boots_color?: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class LaborRelationsAdapterService {
    private myAppUrl: string;
    private http = inject(HttpClient);

    constructor() {
        this.myAppUrl = environment.endpoint;
    }

    // --- Events ---

    getEvents(employeeId: string): Observable<LaborEvent[]> {
        return this.http.get<LaborEvent[]>(`${this.myAppUrl}api/labor-events/${employeeId}`);
    }

    createEvent(eventData: FormData): Observable<any> {
        return this.http.post(`${this.myAppUrl}api/labor-events`, eventData);
    }

    updateEvent(id: number, eventData: FormData): Observable<any> {
        return this.http.put(`${this.myAppUrl}api/labor-events/${id}`, eventData);
    }

    deleteEvent(id: number): Observable<any> {
        return this.http.delete(`${this.myAppUrl}api/labor-events/${id}`);
    }

    // --- Uniforms ---

    getUniforms(employeeId: string): Observable<EmployeeUniform> {
        return this.http.get<EmployeeUniform>(`${this.myAppUrl}api/employee-uniforms/${employeeId}`);
    }

    saveUniforms(uniforms: EmployeeUniform): Observable<any> {
        return this.http.post(`${this.myAppUrl}api/employee-uniforms`, uniforms);
    }
}
