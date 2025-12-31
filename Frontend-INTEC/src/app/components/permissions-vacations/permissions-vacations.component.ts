import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { EmployeeDocumentsAdapterService } from '../../adapters/employee-documents.adapter';
import { Employee } from '../../models/employees';
import { UploadAdapterService } from '../../adapters/upload.adapter';
import { ToastrService } from 'ngx-toastr';

interface VacationRow {
    id: string; // Employee ID
    antiguedad: number;
    num: string;
    nombre: string;
    fechaIngreso: string;
    diasPorTomar2024: number;
    aniversario: string;
    totalVacaciones: number;
    diasTomados: number;
    diasPorTomar2025: number;
    saldoTotal: number;
    detalles: string;
    history: RequestRecord[];
}

interface RequestRecord {
    id: string;
    type: 'Vacaciones' | 'Permiso';
    startDate: string;
    endDate: string;
    daysCount: number;
    description: string;
    documentUrl?: string;
    requestDate: string;
}

@Component({
    selector: 'app-permissions-vacations',
    templateUrl: './permissions-vacations.component.html',
    styleUrls: ['./permissions-vacations.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule]
})
export class PermissionsVacationsComponent implements OnInit {
    allRows: VacationRow[] = [];
    filteredData: VacationRow[] = [];
    searchTerm: string = '';
    loading: boolean = true;
    requestForm: FormGroup;
    requestType: 'Vacaciones' | 'Permiso' = 'Vacaciones';
    selectedFile: File | null = null;

    // History Modal State
    selectedEmployeeName: string = '';
    selectedEmployeeHistory: RequestRecord[] = [];

    constructor(
        private employeesAdapter: EmployeesAdapterService,
        private docService: EmployeeDocumentsAdapterService, // Injected for real uploads
        private fb: FormBuilder,
        private uploadService: UploadAdapterService, // Keep for generic uploads if needed, but preferring docService for Repo
        private toastr: ToastrService
    ) {
        this.requestForm = this.fb.group({
            employeeId: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit(): void {
        this.loadEmployees();
    }

    loadEmployees(): void {
        this.loading = true;
        this.employeesAdapter.getList().subscribe({
            next: (employees) => {
                this.processEmployees(employees);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading employees for vacations', err);
                this.loading = false;
                this.toastr.error('Error al cargar empleados');
            }
        });
    }

    processEmployees(employees: Employee[]): void {
        const currentYear = 2025;

        // Load persistency
        let savedRequests: RequestRecord[] = [];
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('vacation_requests');
            if (saved) {
                try {
                    savedRequests = JSON.parse(saved);
                } catch (e) {
                    console.error('Error parsing saved requests', e);
                }
            }
        }

        this.allRows = employees
            .filter(emp => emp.status)
            .map((emp, index) => {
                const admissionDateStr = emp.admission_date;
                if (!admissionDateStr) return null;

                const admissionDate = new Date(admissionDateStr);
                const admissionYear = admissionDate.getFullYear();

                // Calculate Seniority
                let yearsOfService = currentYear - admissionYear;
                if (yearsOfService < 0) yearsOfService = 0;

                const vacationDays = this.calculateVacationDays(yearsOfService);

                // Format dates
                const anniversaryDate2025 = new Date(currentYear, admissionDate.getMonth(), admissionDate.getDate());
                const anniversaryStr = this.formatDate(anniversaryDate2025);
                const admissionStr = this.formatDate(admissionDate);

                // Filter history for this employee
                // Using generic 'id' property in RequestRecord which actually stores employeeId in my new logic
                // But wait, RequestRecord definition has 'id' as unique request ID.
                // I need to add employeeId to RequestRecord or filter by some other means.
                // Let's assume I will add `employeeId` to RequestRecord interface implicitly or handle it here.
                // Actually, let's update RequestRecord interface in a separate edit or cast it here.
                // For now, I will assume savedRequests contains an 'employeeId' field.

                const empHistory = savedRequests.filter((r: any) => r.employeeId === emp.id_employee);

                const diasPorTomar2024 = 0;

                // Calculate diasTomados from History (only type 'Vacaciones')
                const diasTomados = empHistory
                    .filter((r: any) => r.type === 'Vacaciones')
                    .reduce((sum: number, r: any) => sum + (r.daysCount || 0), 0);

                const diasPorTomar2025 = vacationDays - diasTomados;
                const saldoTotal = diasPorTomar2024 + diasPorTomar2025;
                const num = (index + 1).toString().padStart(4, '0');

                return {
                    id: emp.id_employee,
                    antiguedad: yearsOfService,
                    num: num,
                    nombre: emp.name_employee,
                    fechaIngreso: admissionStr,
                    diasPorTomar2024: diasPorTomar2024,
                    aniversario: anniversaryStr,
                    totalVacaciones: vacationDays,
                    diasTomados: diasTomados,
                    diasPorTomar2025: diasPorTomar2025,
                    saldoTotal: saldoTotal,
                    detalles: '',
                    history: empHistory
                };
            })
            .filter(row => row !== null) as VacationRow[];

        this.applyFilter();
    }

    calculateVacationDays(years: number): number {
        if (years <= 0) return 0;
        if (years === 1) return 12;
        if (years === 2) return 14;
        if (years === 3) return 16;
        if (years === 4) return 18;
        if (years === 5) return 20;

        // 6-10 -> 22, etc.
        if (years >= 6 && years <= 10) return 22;
        if (years >= 11 && years <= 15) return 24;
        if (years >= 16 && years <= 20) return 26;
        if (years >= 21 && years <= 25) return 28;
        if (years >= 26 && years <= 30) return 30;

        const cycles5 = Math.floor((years - 1) / 5);
        return 22 + (cycles5 - 1) * 2;
    }

    formatDate(date: Date): string {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }

    applyFilter(): void {
        if (!this.searchTerm) {
            this.filteredData = this.allRows;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredData = this.allRows.filter(r =>
                r.nombre.toLowerCase().includes(term) ||
                r.num.includes(term)
            );
        }
    }

    // --- Modal Logic ---

    openCreateModal(type: 'Vacaciones' | 'Permiso'): void {
        this.requestType = type;
        this.requestForm.reset();
        this.selectedFile = null;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('createRequestModal'));
        modal.show();
    }

    onFileSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }

    async saveRequest(): Promise<void> {
        if (this.requestForm.invalid) {
            this.toastr.warning('Por favor complete los campos requeridos');
            return;
        }

        const formValues = this.requestForm.value;
        const start = new Date(formValues.startDate);
        const end = new Date(formValues.endDate);
        const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

        if (daysCount <= 0) {
            this.toastr.error('La fecha fin debe ser posterior a la fecha inicio');
            return;
        }

        this.toastr.info('Procesando solicitud...');

        let docPath = '';

        // 1. Upload File to Document Repository if exists
        if (this.selectedFile) {
            try {
                // Prepare FormData for EmployeeDocumentsAdapter
                const formData = new FormData();
                formData.append('id_employee', formValues.employeeId);
                formData.append('document_type', `Justificante ${this.requestType}`);
                formData.append('document', this.selectedFile);

                // Assuming backend returns some object, we wait for it
                const uploadRes = await firstValueFrom(this.docService.saveDocument(formData));
                this.toastr.success('Documento guardado en repositorio');
                // Use a generic path or the one returned if available
                docPath = uploadRes?.path || 'Repositorio';
            } catch (err) {
                console.error('Upload Error', err);
                this.toastr.error('Error al subir el documento al repositorio');
                return;
            }
        }

        // 2. Save Request Locally (Persistence)
        const newRequest: any = {
            id: Math.random().toString(36).substr(2, 9),
            employeeId: formValues.employeeId, // Critical for filtering!
            type: this.requestType,
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            daysCount: daysCount,
            description: formValues.description,
            documentUrl: docPath,
            requestDate: new Date().toISOString().split('T')[0]
        };

        // Load existing
        let savedRequests: any[] = [];
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('vacation_requests');
            if (saved) {
                try {
                    savedRequests = JSON.parse(saved);
                } catch (e) { }
            }
        }

        savedRequests.push(newRequest);
        localStorage.setItem('vacation_requests', JSON.stringify(savedRequests));

        this.toastr.success(`${this.requestType} registrado exitosamente`);

        // Close Modal
        const modalEl = document.getElementById('createRequestModal');
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        this.loadEmployees(); // Refresh view to calculate new totals
    }

    openHistoryModal(row: VacationRow): void {
        this.selectedEmployeeName = row.nombre;
        this.selectedEmployeeHistory = row.history;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
    }
}
