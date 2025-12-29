import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TerminationsAdapterService, Termination } from '../../adapters/terminations.adapter';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { UploadAdapterService } from '../../adapters/upload.adapter';
import { Employee } from '../../models/employees';

declare var bootstrap: any;

@Component({
    selector: 'app-terminations',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './terminations.component.html',
    styleUrls: ['./terminations.component.css']
})
export class TerminationsComponent implements OnInit {
    terminations: Termination[] = [];
    employees: Employee[] = [];
    allEmployees: Employee[] = [];
    isLoading = false;
    searchTerm = '';
    selectedFile: File | null = null;

    terminationForm: FormGroup;
    isEditMode = false;
    selectedTerminationId: number | null = null;
    selectedTermination: Termination | null = null;
    formModal: any;
    viewModal: any;

    constructor(
        private terminationsService: TerminationsAdapterService,
        private employeesService: EmployeesAdapterService,
        private uploadService: UploadAdapterService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private zone: NgZone
    ) {
        this.terminationForm = this.fb.group({
            id_employee: ['', Validators.required],
            last_work_day: ['', Validators.required],
            reason: ['', Validators.required],
            severance_date: [''],
            observation: [''],
            document_path: [''],
            document_name: ['']
        });
    }

    get filteredTerminations(): Termination[] {
        if (!this.searchTerm) {
            return this.terminations;
        }
        const lowerTerm = this.searchTerm.toLowerCase();
        return this.terminations.filter(t =>
            (t.employee?.name_employee?.toLowerCase().includes(lowerTerm) ?? false) ||
            (t.name_employee?.toLowerCase().includes(lowerTerm) ?? false) ||
            (t.reason.toLowerCase().includes(lowerTerm)) ||
            (t.observation?.toLowerCase().includes(lowerTerm) ?? false)
        );
    }

    ngOnInit(): void {
        this.loadTerminations();
        this.loadEmployees();
    }

    loadTerminations(): void {
        this.isLoading = true;
        this.terminationsService.getTerminations().subscribe({
            next: (data: Termination[]) => {
                this.terminations = data;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading terminations', err);
                this.isLoading = false;
            }
        });
    }

    loadEmployees(): void {
        this.employeesService.getList().subscribe({
            next: (data: Employee[]) => {
                this.allEmployees = data;
                this.employees = data.filter(emp => emp.status === true);
            },
            error: (err: any) => {
                console.error('Error loading employees', err);
            }
        });
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.selectedTerminationId = null;
        this.selectedFile = null;
        // Reset employees list to only Active ones
        this.employees = this.allEmployees.filter(emp => emp.status === true);

        this.terminationForm.reset();
        this.showModal();
    }

    openEditModal(termination: Termination): void {
        this.isEditMode = true;
        this.selectedTerminationId = termination.id!;
        this.selectedFile = null;

        // Filter employees to ONLY the one related to this termination
        this.employees = this.allEmployees.filter(emp => emp.id_employee === termination.id_employee);

        this.terminationForm.patchValue({
            id_employee: termination.id_employee,
            last_work_day: termination.last_work_day,
            reason: termination.reason,
            severance_date: termination.severance_date,
            observation: termination.observation,
            document_path: termination.document_path,
            document_name: termination.document_name
        });
        this.showModal();
    }

    onFileSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }

    showModal(): void {
        const modalElement = document.getElementById('terminationModal');
        if (modalElement) {
            this.formModal = new bootstrap.Modal(modalElement);
            this.formModal.show();
        }
    }

    hideModal(): void {
        if (this.formModal) {
            this.formModal.hide();
        }
    }

    saveTermination(): void {
        if (this.terminationForm.invalid) {
            return;
        }

        const formData = this.terminationForm.value;

        // Helper function to proceed with save/update
        const processSave = (data: any) => {
            console.log("Frontend: Prepared data for save:", data); // DEBUG LOG
            if (this.isEditMode && this.selectedTerminationId) {
                this.terminationsService.updateTermination(this.selectedTerminationId, data).subscribe({
                    next: () => {
                        this.loadTerminations();
                        this.hideModal();
                        this.zone.run(() => {
                            this.toastr.success('Baja actualizada correctamente', 'Éxito');
                        });
                    },
                    error: (err: any) => {
                        console.error('Error updating termination', err);
                        this.zone.run(() => {
                            this.toastr.error('Error al actualizar la baja', 'Error');
                        });
                    }
                });
            } else {
                this.terminationsService.createTermination(data).subscribe({
                    next: () => {
                        this.loadTerminations();
                        this.hideModal();
                        this.zone.run(() => {
                            this.toastr.success('Baja registrada correctamente', 'Éxito');
                        });
                    },
                    error: (err: any) => {
                        console.error('Error creating termination', err);
                        this.zone.run(() => {
                            this.toastr.error('Error al registrar la baja', 'Error');
                        });
                    }
                });
            }
        };

        if (this.selectedFile) {
            console.log("Frontend: File selected, starting upload..."); // DEBUG LOG
            this.uploadService.uploadFile(this.selectedFile).subscribe({
                next: (res) => {
                    console.log("Frontend: Upload successful, Path:", res.path); // DEBUG LOG
                    formData.document_path = res.path;
                    processSave(formData);
                },
                error: (err) => {
                    console.error('Error uploading file', err);
                    this.toastr.error('Error al cargar el documento. Guardando sin archivo...', 'Advertencia');
                    processSave(formData);
                }
            });
        } else {
            console.log("Frontend: No file selected."); // DEBUG LOG
            processSave(formData);
        }
    }

    deleteTermination(id: number): void {
        if (confirm('¿Estás seguro de eliminar esta baja? Esta acción también eliminará el evento de relaciones laborales.')) {
            this.terminationsService.deleteTermination(id).subscribe({
                next: () => {
                    this.loadTerminations();
                    this.zone.run(() => {
                        this.toastr.success('Baja eliminada correctamente', 'Éxito');
                    });
                },
                error: (err: any) => {
                    console.error('Error deleting termination', err);
                    this.zone.run(() => {
                        this.toastr.error('Error al eliminar la baja', 'Error');
                    });
                }
            });
        }
    }

    viewTermination(termination: Termination): void {
        this.selectedTermination = termination;
        const modalElement = document.getElementById('viewTerminationModal');
        if (modalElement) {
            this.viewModal = new bootstrap.Modal(modalElement);
            this.viewModal.show();
        }
    }

    hideViewModal(): void {
        if (this.viewModal) {
            this.viewModal.hide();
        }
    }
}
