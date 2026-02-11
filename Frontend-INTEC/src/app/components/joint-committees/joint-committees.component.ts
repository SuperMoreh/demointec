import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommitteeDocumentsAdapterService } from '../../adapters/committee-documents.adapter';
import { ErrorService } from '../../services/errror.services';
import { CommitteeDocument } from '../../models/committee_document';

interface CommitteeSection {
  key: string;
  label: string;
  abbreviation: string;
  expanded: boolean;
  documents: CommitteeDocument[];
  filteredDocuments: CommitteeDocument[];
  isLoading: boolean;
  loaded: boolean;
}

@Component({
  selector: 'app-joint-committees',
  templateUrl: './joint-committees.component.html',
  styleUrl: './joint-committees.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class JointCommitteesComponent {
  private committeeDocsAdapter = inject(CommitteeDocumentsAdapterService);
  private toastr = inject(ToastrService);
  private errorService = inject(ErrorService);
  private destroyRef = inject(DestroyRef);

  searchTerm: string = '';
  sections: CommitteeSection[] = [];

  showUploadModal: boolean = false;
  uploadSection: CommitteeSection | null = null;
  selectedFile: File | null = null;
  isUploading: boolean = false;

  ngOnInit(): void {
    this.initSections();
  }

  initSections(): void {
    this.sections = [
      { key: 'CSH', label: 'Seguridad e Higiene', abbreviation: 'CSH', expanded: false, documents: [], filteredDocuments: [], isLoading: false, loaded: false },
      { key: 'CMPCA', label: 'Capacitación, Adiestramiento y Productividad', abbreviation: 'CMPCA', expanded: false, documents: [], filteredDocuments: [], isLoading: false, loaded: false },
      { key: 'RIT', label: 'Reglamento Interior de Trabajo', abbreviation: 'RIT', expanded: false, documents: [], filteredDocuments: [], isLoading: false, loaded: false },
      { key: 'CGA', label: 'Cuadro General de Antigüedades', abbreviation: 'CGA', expanded: false, documents: [], filteredDocuments: [], isLoading: false, loaded: false },
      { key: 'PTU', label: 'Participación de los Trabajadores en las Utilidades', abbreviation: 'PTU', expanded: false, documents: [], filteredDocuments: [], isLoading: false, loaded: false }
    ];
  }

  onSearchInput(): void {
    const term = this.searchTerm.toLowerCase().trim();
    for (const section of this.sections) {
      if (section.loaded) {
        section.filteredDocuments = term.length === 0
          ? [...section.documents]
          : section.documents.filter(d =>
              (d.name_document || '').toLowerCase().includes(term)
            );
      }
    }
  }

  toggleSection(section: CommitteeSection): void {
    section.expanded = !section.expanded;

    if (section.expanded && !section.loaded) {
      this.loadDocuments(section);
    }
  }

  loadDocuments(section: CommitteeSection): void {
    section.isLoading = true;
    this.committeeDocsAdapter.getDocumentsByType(section.key)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (docs) => {
          section.documents = docs;
          this.applyFilter(section);
          section.isLoading = false;
          section.loaded = true;
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
          section.isLoading = false;
        }
      });
  }

  private applyFilter(section: CommitteeSection): void {
    const term = this.searchTerm.toLowerCase().trim();
    section.filteredDocuments = term.length === 0
      ? [...section.documents]
      : section.documents.filter(d =>
          (d.name_document || '').toLowerCase().includes(term)
        );
  }

  openUploadModal(section: CommitteeSection): void {
    this.uploadSection = section;
    this.selectedFile = null;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadSection = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.uploadSection) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('document', this.selectedFile);
    formData.append('document_type', this.uploadSection.key);

    this.committeeDocsAdapter.saveDocument(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Documento subido correctamente', 'Éxito');
          this.isUploading = false;
          const section = this.uploadSection!;
          this.closeUploadModal();
          section.loaded = false;
          this.loadDocuments(section);
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
          this.isUploading = false;
        }
      });
  }

  viewDocument(doc: CommitteeDocument): void {
    if (doc.document_path) {
      window.open(doc.document_path, '_blank');
    }
  }

  downloadDocument(doc: CommitteeDocument): void {
    if (!doc.document_path) return;

    const fileName = doc.name_document || 'documento';

    this.committeeDocsAdapter.downloadDocument(doc.document_path)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.toastr.error('No se pudo descargar el documento', 'Error');
        }
      });
  }

  deleteDocument(doc: CommitteeDocument, section: CommitteeSection): void {
    if (!doc.id) return;
    if (!confirm('¿Está seguro de eliminar este documento?')) return;

    this.committeeDocsAdapter.deleteDocument(doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Documento eliminado correctamente', 'Éxito');
          section.loaded = false;
          this.loadDocuments(section);
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
        }
      });
  }
}
