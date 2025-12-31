import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
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
        private fb: FormBuilder,
        private uploadService: UploadAdapterService,
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

                // Mock Data for demonstration since we don't have a backend table for this yet
                const diasPorTomar2024 = 0;
                const diasTomados = 0;
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
                    history: [] // Initially empty, would come from backend
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

        let docUrl = '';
        // 1. Upload File if exists
        if (this.selectedFile) {
            try {
                const uploadRes = await firstValueFrom(this.uploadService.uploadFile(this.selectedFile));
                if (uploadRes) {
                    docUrl = uploadRes.path; // Assuming facade returns object with path/url
                }
            } catch (err) {
                console.error('Upload Error', err);
                this.toastr.error('Error al subir el documento');
                return;
            }
        }

        // 2. Create Request Record (Mocking Backend Persistence)
        const newRequest: RequestRecord = {
            id: Math.random().toString(36).substr(2, 9),
            type: this.requestType,
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            daysCount: daysCount,
            description: formValues.description,
            documentUrl: docUrl,
            requestDate: new Date().toISOString().split('T')[0]
        };

        // 3. Update "Local" State to simulate immediate update
        const empIndex = this.allRows.findIndex(row => row.id === formValues.employeeId);
        if (empIndex >= 0) {
            this.allRows[empIndex].history.push(newRequest);

            // Update totals if it matches current year context? 
            // For now, just adding to history list.

            this.toastr.success(`${this.requestType} registrado exitosamente`);

            // Close Modal
            const modalEl = document.getElementById('createRequestModal');
            const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            this.loadEmployees(); // Refresh view
        } else {
            this.toastr.error('Empleado no encontrado en la lista local');
        }
    }

    openHistoryModal(row: VacationRow): void {
        this.selectedEmployeeName = row.nombre;
        this.selectedEmployeeHistory = row.history;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
    }
}
