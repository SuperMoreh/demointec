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
    diasPorTomarPrevious: number;
    aniversarioCurrent: string;
    totalVacaciones: number;
    diasTomados: number; // Current year taken
    diasPorTomarCurrent: number;
    saldoTotal: number;
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

    // Dynamic Years
    currentYear: number = new Date().getFullYear();
    previousYear: number = new Date().getFullYear() - 1;

    // Calendar State
    calendarCurrentDate: Date = new Date();
    weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    calendarDays: any[] = [];
    calendarMonthLabel: string = '';

    // History Modal State
    selectedEmployeeName: string = '';
    selectedEmployeeId: string = '';
    selectedEmployeeHistory: RequestRecord[] = [];

    // Permission State
    canManage: boolean = false;

    // State for Edit Mode
    editingRequestId: string | null = null;
    isReadOnly: boolean = false;
    currentDocumentUrl: string | null = null;

    constructor(
        private employeesAdapter: EmployeesAdapterService,
        private docService: EmployeeDocumentsAdapterService,
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
        const currentYear = this.currentYear;
        const previousYear = this.previousYear;

        // Check Permissions (Live Update)
        if (typeof localStorage !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const currentUserEmail = user.email;

                    // Find current user in the fresh employees list
                    const currentEmployee = employees.find(e => e.email === currentUserEmail);

                    if (currentEmployee) {
                        // Use fresh permission from DB
                        this.canManage = currentEmployee.pPermisosVacaciones === '1';
                    } else {
                        // Fallback to localStorage if not found in list (e.g. admin not in employee list)
                        this.canManage = user.pPermisosVacaciones === '1';
                    }
                } catch (e) {
                    console.error('Error parsing user for permissions', e);
                }
            }
        }

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

                // Calculate Seniority for Current Year
                let yearsOfServiceCurrent = currentYear - admissionYear;
                if (yearsOfServiceCurrent < 0) yearsOfServiceCurrent = 0;

                // Calculate Seniority for Previous Year
                let yearsOfServicePrev = previousYear - admissionYear;
                if (yearsOfServicePrev < 0) yearsOfServicePrev = 0;

                const entitlementCurrent = this.calculateVacationDays(yearsOfServiceCurrent);
                const entitlementPrevious = this.calculateVacationDays(yearsOfServicePrev);

                // Format dates
                const anniversaryDateCurrent = new Date(currentYear, admissionDate.getMonth(), admissionDate.getDate());
                const anniversaryStr = this.formatDate(anniversaryDateCurrent);
                const admissionStr = this.formatDate(admissionDate);

                const empHistory = savedRequests.filter((r: any) => r.employeeId === emp.id_employee);

                // Calculate Taken Days for Previous Year
                const takenPrevious = empHistory
                    .filter((r: any) => r.type === 'Vacaciones' && new Date(r.startDate).getFullYear() === previousYear)
                    .reduce((sum: number, r: any) => sum + (r.daysCount || 0), 0);

                // Calculate Taken Days for Current Year
                const takenCurrent = empHistory
                    .filter((r: any) => r.type === 'Vacaciones' && new Date(r.startDate).getFullYear() === currentYear)
                    .reduce((sum: number, r: any) => sum + (r.daysCount || 0), 0);

                let diasPorTomarPrevious = entitlementPrevious - takenPrevious;
                // Optional: Clamp negative previous balance if needed, but usually it can be negative or 0.
                // Assuming standard logic where unused days carry over, but here we just show strict year math as requested.
                // However, if yearsOfServicePrev was 0 (new employee last year), existing logic works.
                // If employee joined THIS year, Previous Entitlement is 0. Balance 0. Correct.

                let diasPorTomarCurrent = entitlementCurrent - takenCurrent;

                const saldoTotal = diasPorTomarPrevious + diasPorTomarCurrent;
                const num = (index + 1).toString().padStart(4, '0');

                return {
                    id: emp.id_employee,
                    antiguedad: yearsOfServiceCurrent,
                    num: num,
                    nombre: emp.name_employee,
                    fechaIngreso: admissionStr,
                    diasPorTomarPrevious: diasPorTomarPrevious,
                    aniversarioCurrent: anniversaryStr,
                    totalVacaciones: entitlementCurrent, // Label is 'TOTAL DIAS LEY', usually refers to current entitlement
                    diasTomados: takenCurrent, // Showing Current Year Usage to match the 'Current' row logic visually
                    diasPorTomarCurrent: diasPorTomarCurrent,
                    saldoTotal: saldoTotal,
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
        this.requestForm.enable();
        this.selectedFile = null;
        this.editingRequestId = null;
        this.isReadOnly = false;
        this.currentDocumentUrl = null;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('createRequestModal'));
        modal.show();
    }

    // Helper to open edit from history
    editRequest(record: RequestRecord, employeeId: string): void {
        this.requestType = record.type;
        this.editingRequestId = record.id;
        this.selectedFile = null;
        this.isReadOnly = false;
        this.currentDocumentUrl = record.documentUrl || null;

        this.requestForm.patchValue({
            employeeId: employeeId,
            startDate: record.startDate,
            endDate: record.endDate,
            description: record.description
        });
        this.requestForm.enable();

        this.switchModal();
    }

    viewRequest(record: RequestRecord, employeeId: string): void {
        this.requestType = record.type;
        this.editingRequestId = record.id;
        this.selectedFile = null;
        this.isReadOnly = true;
        this.currentDocumentUrl = record.documentUrl || null;

        this.requestForm.patchValue({
            employeeId: employeeId,
            startDate: record.startDate,
            endDate: record.endDate,
            description: record.description
        });
        this.requestForm.disable();

        this.switchModal();
    }

    deleteRequest(record: RequestRecord): void {
        if (!confirm('¿Está seguro de que desea eliminar este registro?')) return;

        let savedRequests: any[] = [];
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('vacation_requests');
            if (saved) savedRequests = JSON.parse(saved);
        }

        const initialLength = savedRequests.length;
        savedRequests = savedRequests.filter(r => r.id !== record.id);

        if (savedRequests.length < initialLength) {
            localStorage.setItem('vacation_requests', JSON.stringify(savedRequests));
            this.toastr.success('Registro eliminado');
            this.loadEmployees(); // Reload to update lists

            // Also need to refresh the open history modal if it's open
            // Simplest way is to close it or re-fetch data for it.
            // Since loadEmployees refreshes allRows, we can re-find the row and update selectedEmployeeHistory
            // However, `loadEmployees` is async observable... so we might need to handle that.
            // Ideally we just remove it from `selectedEmployeeHistory` locally too.
            this.selectedEmployeeHistory = this.selectedEmployeeHistory.filter(r => r.id !== record.id);
        } else {
            this.toastr.error('No se pudo encontrar el registro para eliminar');
        }
    }

    private switchModal(): void {
        const historyModalEl = document.getElementById('historyModal');
        if (historyModalEl) {
            const historyModal = (window as any).bootstrap.Modal.getInstance(historyModalEl);
            if (historyModal) historyModal.hide();
        }

        const createModal = new (window as any).bootstrap.Modal(document.getElementById('createRequestModal'));
        createModal.show();
    }

    onFileSelected(event: any): void {
        if (this.isReadOnly) return;
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }

    async saveRequest(): Promise<void> {
        if (this.isReadOnly) return; // Prevention
        if (this.requestForm.invalid) {
            this.toastr.warning('Por favor complete los campos requeridos');
            return;
        }

        const formValues = this.requestForm.value; // Note: if disabled, value might be missing fields depending on Angular version/config. 
        // But we re-enable before save? No, readOnly shouldn't save.
        // For Edit, form is enabled.

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
                const formData = new FormData();
                formData.append('id_employee', formValues.employeeId);
                formData.append('document_type', `Justificante ${this.requestType}`);
                formData.append('document', this.selectedFile);

                const uploadRes = await firstValueFrom(this.docService.saveDocument(formData));
                this.toastr.success('Documento guardado en repositorio');
                docPath = uploadRes?.path || 'Repositorio';
            } catch (err) {
                console.error('Upload Error', err);
                this.toastr.error('Error al subir el documento al repositorio');
                return;
            }
        }

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

        if (this.editingRequestId) {
            // UPDATE
            const index = savedRequests.findIndex(r => r.id === this.editingRequestId);
            if (index !== -1) {
                savedRequests[index] = {
                    ...savedRequests[index],
                    employeeId: formValues.employeeId,
                    type: this.requestType,
                    startDate: formValues.startDate,
                    endDate: formValues.endDate,
                    daysCount: daysCount,
                    description: formValues.description,
                    // Only update docUrl if new one uploaded, else keep old
                    documentUrl: docPath || savedRequests[index].documentUrl
                };
                this.toastr.success('Registro actualizado exitosamente');
            }
        } else {
            // CREATE
            const newRequest: any = {
                id: Math.random().toString(36).substr(2, 9),
                employeeId: formValues.employeeId,
                type: this.requestType,
                startDate: formValues.startDate,
                endDate: formValues.endDate,
                daysCount: daysCount,
                description: formValues.description,
                documentUrl: docPath,
                requestDate: new Date().toISOString().split('T')[0]
            };
            savedRequests.push(newRequest);
            this.toastr.success(`${this.requestType} registrado exitosamente`);
        }

        localStorage.setItem('vacation_requests', JSON.stringify(savedRequests));

        // Close Modal
        const modalEl = document.getElementById('createRequestModal');
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        this.loadEmployees(); // Refresh view
    }

    openHistoryModal(row: VacationRow): void {
        this.selectedEmployeeName = row.nombre;
        this.selectedEmployeeId = row.id;
        this.selectedEmployeeHistory = row.history;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
    }

    // --- Calendar Logic ---

    openCalendarModal(): void {
        this.calendarCurrentDate = new Date(); // Reset to today
        this.buildCalendar();
        const modal = new (window as any).bootstrap.Modal(document.getElementById('calendarModal'));
        modal.show();
    }

    changeMonth(delta: number): void {
        this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() + delta);
        // Force update reference to trigger change detection if needed (though mutation works usually in Angular default strategy)
        this.calendarCurrentDate = new Date(this.calendarCurrentDate);
        this.buildCalendar();
    }

    buildCalendar(): void {
        const year = this.calendarCurrentDate.getFullYear();
        const month = this.calendarCurrentDate.getMonth();

        // Month Label
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        this.calendarMonthLabel = `${monthNames[month]} ${year}`;

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        // Days in month
        const daysInMonth = lastDay.getDate();

        // Day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        const startDayOfWeek = firstDay.getDay();

        this.calendarDays = [];

        // Add empty padding days for start
        for (let i = 0; i < startDayOfWeek; i++) {
            this.calendarDays.push({ day: null, events: [] });
        }

        // Collect all events from all employees
        // We need to flatten the history of all rows
        const allEvents = this.allRows.flatMap(row =>
            row.history.map(h => ({
                ...h,
                employeeName: row.nombre
            }))
        );

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDayDate = new Date(year, month, i);
            const dateStr = this.formatDateIso(currentDayDate); // YYYY-MM-DD for comparison

            // Filter events that include this day
            const dayEvents = allEvents.filter(event => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                // Reset times to compare strictly dates
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                // Check if currentDayDate is within range [start, end]
                return currentDayDate >= start && currentDayDate <= end;
            });

            this.calendarDays.push({
                day: i,
                date: currentDayDate,
                events: dayEvents
            });
        }
    }

    // Helper to format date as YYYY-MM-DD for simpler comparison if needed, 
    // although direct Date object comparison (normalized) is often safer.
    // Kept this for reference or debugging.
    private formatDateIso(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    onEventClick(event: any): void {
        // Must close calendar modal first to show the detail modal properly or handle stacking
        // For simplicity and to reuse existing logic:
        const calendarModalEl = document.getElementById('calendarModal');
        if (calendarModalEl) {
            const calendarModal = (window as any).bootstrap.Modal.getInstance(calendarModalEl);
            if (calendarModal) calendarModal.hide();
        }

        // Use setTimeout to ensure previous modal finishes hiding if animations conflict, 
        // though Bootstrap 5 usually handles stacking if configured, but 'hide' is safer for now.
        setTimeout(() => {
            this.viewRequest(event, event.employeeId);
        }, 150);
    }
}
