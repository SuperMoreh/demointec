import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateAnalysis } from '../models/template-analysis';

@Injectable({
    providedIn: 'root'
})
export class TemplateAnalysisAdapterService {
    private apiUrl = `${environment.endpoint}api/analisis-plantillas`;
    private http = inject(HttpClient);

    getList(): Observable<TemplateAnalysis> {
        return this.http.get<TemplateAnalysis>(this.apiUrl);
    }
}
