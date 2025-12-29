import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { JobDescriptionAdapterService, JobDescription } from '../../adapters/job-description.adapter';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-job-description',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './job-description.component.html',
    styleUrls: ['./job-description.component.css']
})
export class JobDescriptionComponent implements OnInit {
    jobDescriptions: JobDescription[] = [];
    jobForm: FormGroup;
    isModalOpen = false;
    isEditMode = false;
    selectedJobId: number | null = null;

    // Filters & Pagination
    searchTerm: string = '';
    filteredJobDescriptions: JobDescription[] = [];
    paginatedJobDescriptions: JobDescription[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 1;
    pages: number[] = [];

    hasPermission: boolean = false;
    isViewMode: boolean = false;

    // Document Management
    documents: { name: string, path: string | null }[] = [];
    newDocumentName: string = '';
    selectedFile: File | null = null;
    @ViewChild('fileInput') fileInput: any;

    private adapter = inject(JobDescriptionAdapterService);
    private employeesAdapter = inject(EmployeesAdapterService);
    private fb = inject(FormBuilder);
    private toastr = inject(ToastrService);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.jobForm = this.fb.group({
            job_title: ['', Validators.required],
            immediate_boss: [''],
            subordinates: [''],
            basic_function: [''],
            responsibility_level: [''],
            employment_type: [''],
            shift: [''],
            schedule_mon_fri: [''],
            schedule_weekend: [''],
            decision_making: [''],
            general_objective: [''],
            functions: [''],
            tasks: [''],
            required_documents: ['']
        });
    }

    ngOnInit(): void {
        this.checkPermissions();
        this.loadJobDescriptions();
    }

    checkPermissions() {
        if (typeof localStorage !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);

                // 1. Try to get ID
                const userId = user.id_employee || user.id || user.uid;

                if (userId) {
                    // Optimized path: Get by ID
                    this.employeesAdapter.get(userId).subscribe({
                        next: (freshUser) => this.updatePermissions(user, freshUser),
                        error: (err) => console.error('Error verifying permissions by ID', err)
                    });
                } else if (user.email) {
                    // Fallback path: Get all and find by Email
                    this.employeesAdapter.getList().subscribe({
                        next: (employees) => {
                            const freshUser = employees.find(e => e.email === user.email);
                            if (freshUser) {
                                this.updatePermissions(user, freshUser);
                            }
                        },
                        error: (err) => console.error('Error verifying permissions by email', err)
                    });
                }
            }
        }
    }

    private updatePermissions(currentUser: any, freshUser: any) {
        // Relaxed check: string '1', number 1, or boolean true
        this.hasPermission = (freshUser.pDescripcionesPuestos as any) == '1' || (freshUser.pDescripcionesPuestos as any) === true;

        // Merge fresh data (including ID if it was missing)
        const mergedUser = { ...currentUser, ...freshUser };
        localStorage.setItem('user', JSON.stringify(mergedUser));

        this.cdr.detectChanges();
    }

    loadJobDescriptions() {
        console.log('Loading job descriptions...');
        this.adapter.getAll().subscribe({
            next: (data) => {
                console.log('Job descriptions loaded:', data);
                this.jobDescriptions = data;
                this.applyFilters();
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading job descriptions', err)
        });
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0] || null;
    }

    addDocument() {
        if (!this.newDocumentName.trim()) {
            this.toastr.warning("Escribe un nombre para el documento");
            return;
        }

        if (!this.selectedFile) {
            this.toastr.warning("Debes subir un archivo para este documento");
            return;
        }

        // Upload file
        this.adapter.uploadFile(this.selectedFile).subscribe({
            next: (res) => {
                this.documents.push({
                    name: this.newDocumentName.trim(),
                    path: res.path // Store the path returned by server
                });
                this.resetDocInput();
                this.toastr.success("Documento y archivo agregados");
            },
            error: (err) => {
                console.error(err);
                this.toastr.error("Error al subir archivo");
            }
        });
    }

    resetDocInput() {
        this.newDocumentName = '';
        this.selectedFile = null;
        if (this.fileInput) this.fileInput.nativeElement.value = '';
    }

    removeDocument(index: number) {
        this.documents.splice(index, 1);
    }

    openModal(job?: JobDescription) {
        this.isModalOpen = true;
        this.isViewMode = false;
        this.jobForm.enable();
        this.documents = []; // Reset documents
        this.newDocumentName = '';

        if (job) {
            this.isEditMode = true;
            this.selectedJobId = job.id!;
            this.jobForm.patchValue(job);

            // Parse required_documents
            if (job.required_documents) {
                try {
                    const parsed = JSON.parse(job.required_documents);
                    if (Array.isArray(parsed)) {
                        // Normalize to objects
                        this.documents = parsed.map(d => {
                            if (typeof d === 'string') return { name: d, path: null };
                            return d; // Already object
                        });
                    }
                } catch (e) {
                    console.error('Error parsing required_documents', e);
                }
            }
        } else {
            this.isEditMode = false;
            this.selectedJobId = null;
            this.jobForm.reset();
        }
    }

    viewJob(job: JobDescription) {
        this.isModalOpen = true;
        this.isViewMode = true;
        this.isEditMode = false;
        this.selectedJobId = job.id!;
        this.jobForm.patchValue(job);

        this.documents = [];
        if (job.required_documents) {
            try {
                const parsed = JSON.parse(job.required_documents);
                if (Array.isArray(parsed)) {
                    // Normalize to objects
                    this.documents = parsed.map(d => {
                        if (typeof d === 'string') return { name: d, path: null };
                        return d; // Already object
                    });
                }
            } catch (e) {
                console.error('Error parsing required_documents', e);
            }
        }

        this.jobForm.disable();
    }

    closeModal() {
        this.isModalOpen = false;
        this.isViewMode = false;
        this.jobForm.enable();
    }

    saveJob() {
        if (this.isViewMode) return;

        if (this.jobForm.invalid) {
            this.toastr.error('Por favor completa los campos requeridos', 'Error');
            return;
        }

        const jobData: JobDescription = this.jobForm.value;

        // Serialize documents
        jobData.required_documents = JSON.stringify(this.documents);

        if (this.isEditMode && this.selectedJobId) {
            this.adapter.update(this.selectedJobId, jobData).subscribe({
                next: () => {
                    this.toastr.success('La descripción de puesto ha sido actualizada', 'Actualizado');
                    this.loadJobDescriptions();
                    this.closeModal();
                },
                error: (err) => {
                    console.error(err);
                    this.toastr.error('No se pudo actualizar', 'Error');
                }
            });
        } else {
            this.adapter.create(jobData).subscribe({
                next: () => {
                    this.toastr.success('La descripción de puesto ha sido creada', 'Creado');
                    this.loadJobDescriptions();
                    this.closeModal();
                },
                error: (err) => {
                    console.error(err);
                    this.toastr.error('No se pudo crear', 'Error');
                }
            });
        }
    }

    deleteJob(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este puesto?')) {
            this.adapter.delete(id).subscribe({
                next: () => {
                    this.toastr.success('El registro ha sido eliminado', 'Eliminado');
                    this.loadJobDescriptions();
                },
                error: (err) => this.toastr.error('No se pudo eliminar', 'Error')
            });
        }
    }

    // Filter & Pagination Logic
    applyFilters() {
        if (!this.searchTerm) {
            this.filteredJobDescriptions = [...this.jobDescriptions];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredJobDescriptions = this.jobDescriptions.filter(job =>
                job.job_title?.toLowerCase().includes(term) ||
                job.immediate_boss?.toLowerCase().includes(term) ||
                job.employment_type?.toLowerCase().includes(term)
            );
        }
        this.totalPages = Math.ceil(this.filteredJobDescriptions.length / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.setPage(1);
    }

    setPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedJobDescriptions = this.filteredJobDescriptions.slice(startIndex, endIndex);
    }

    clearFilters() {
        this.searchTerm = '';
        this.applyFilters();
    }
}
