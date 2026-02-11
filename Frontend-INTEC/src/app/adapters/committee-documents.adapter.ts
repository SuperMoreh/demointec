import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CommitteeDocument } from '../models/committee_document';

@Injectable({
  providedIn: 'root'
})
export class CommitteeDocumentsAdapterService {
  private myAppUrl: string;
  private myApiUrl = 'api/comisiones-documentos/';
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
  }

  getDocumentsByEmployee(employeeId: string): Observable<CommitteeDocument[]> {
    return this.http.get<CommitteeDocument[]>(`${this.myAppUrl}${this.myApiUrl}${employeeId}`);
  }

  getDocumentsByType(documentType: string): Observable<CommitteeDocument[]> {
    return this.http.get<CommitteeDocument[]>(`${this.myAppUrl}${this.myApiUrl}tipo/${documentType}`);
  }

  saveDocument(docData: FormData): Observable<CommitteeDocument> {
    return this.http.post<CommitteeDocument>(`${this.myAppUrl}${this.myApiUrl}`, docData);
  }

  downloadDocument(url: string): Observable<Blob> {
    return this.http.post(`${this.myAppUrl}api/comisiones-documentos-download`, { url }, { responseType: 'blob' });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }
}
