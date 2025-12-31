import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { Employee } from '../../models/employees';

interface VacationRow {
    antiguedad: number;
    num: string; // Using ID or a generated number
    nombre: string;
    fechaIngreso: string;
    diasPorTomar2024: number; // Placeholder/Mock for now
    aniversario: string; // Anniversary date in 2025
    totalVacaciones: number; // Calculated based on law
    diasTomados: number; // Placeholder/Mock for now
    diasPorTomar2025: number; // Calculated
    saldoTotal: number; // Calculated
    detalles: string; // Placeholder text
}

@Component({
    selector: 'app-permissions-vacations',
    templateUrl: './permissions-vacations.component.html',
    styleUrls: ['./permissions-vacations.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule]
})
export class PermissionsVacationsComponent implements OnInit {
    allRows: VacationRow[] = [];
    filteredData: VacationRow[] = [];
    searchTerm: string = '';
    loading: boolean = true;

    // Mexican Labor Law (Vacaciones Dignas) Table
    // Years -> Days
    // 1 -> 12
    // 2 -> 14
    // 3 -> 16
    // 4 -> 18
    // 5 -> 20
    // 6-10 -> 22
    // 11-15 -> 24
    // 16-20 -> 26
    // 21-25 -> 28
    // ...

    constructor(private employeesAdapter: EmployeesAdapterService) { }

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
            }
        });
    }

    processEmployees(employees: Employee[]): void {
        const today = new Date(); // Or hardcode to 2025 if looking into future as per request "Vacaciones 2025"
        // Since the image says "Vacaciones 2025", let's assume we are calculating for year 2025.
        const currentYear = 2025;

        this.allRows = employees
            .filter(emp => emp.status) // Only active employees usually
            .map((emp, index) => {
                const admissionDateStr = emp.admission_date;
                if (!admissionDateStr) return null;

                const admissionDate = new Date(admissionDateStr);
                const admissionYear = admissionDate.getFullYear();

                // Calculate Seniority (Antigüedad) in Years aimed at 2025 Anniversary
                let yearsOfService = currentYear - admissionYear;
                // Adjust if they joined in 2025 (0 years) or future (negative - should not happen for existing)
                if (yearsOfService < 0) yearsOfService = 0;

                // Calculate Days based on Law
                const vacationDays = this.calculateVacationDays(yearsOfService);

                // Format dates
                // Anniversary in 2025
                const anniversaryDate2025 = new Date(currentYear, admissionDate.getMonth(), admissionDate.getDate());
                const anniversaryStr = this.formatDate(anniversaryDate2025);
                const admissionStr = this.formatDate(admissionDate);

                // Placeholder logic for "Dias por tomar 2024" and "Dias tomados"
                // In a real app, these would come from a database of separate vacation requests.
                // For now, we initialize them to 0 or random for demo purposes BUT best to keep clean 0.
                const diasPorTomar2024 = 0;
                const diasTomados = 0;

                const diasPorTomar2025 = vacationDays - diasTomados;
                const saldoTotal = diasPorTomar2024 + diasPorTomar2025;

                // Generate ID like 0001, 0002... if not present. 
                // Using index + 1 padded.
                const num = (index + 1).toString().padStart(4, '0');

                return {
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
                    detalles: '' // Placeholder
                };
            })
            .filter(row => row !== null) as VacationRow[];

        this.applyFilter();

        // Console test output
        console.log('--- TABLE DATA PROCESSED (Console Verification) ---');
        console.table(this.allRows);
    }

    calculateVacationDays(years: number): number {
        if (years <= 0) return 0; // Or maybe proportional if < 1, but usually legal entitlement is after 1 year. 
        // Current law says 12 days after 1st year.
        if (years === 1) return 12;
        if (years === 2) return 14;
        if (years === 3) return 16;
        if (years === 4) return 18;
        if (years === 5) return 20;

        // From 6 onwards, +2 every 5 years
        // 6-10: 22
        // 11-15: 24
        // 16-20: 26
        // etc.
        if (years >= 6 && years <= 10) return 22;
        if (years >= 11 && years <= 15) return 24;
        if (years >= 16 && years <= 20) return 26;
        if (years >= 21 && years <= 25) return 28;
        if (years >= 26 && years <= 30) return 30;

        // Generic formula for > 5
        // Base 20 for 5 years.
        // Cycles of 5 years add 2 days.
        // floor((years - 1) / 5) gives us the bracket index roughly? 
        // Let's stick to the explicit blocks or a simple loop if needed, but the blocks cover most cases.
        // Fallback formula:
        // 6-10 -> 1 cycle past 5. 20 + 2 = 22.
        // 11-15 -> 2 cycles past 5. 20 + 4 = 24.
        const cycles5 = Math.floor((years - 1) / 5);
        // Base 20 at 5 years. For years > 5:
        // cycles5 for 6-10 is 1. (6-1)/5 = 1. (10-1)/5 = 1.
        // Days = 20 + (cycles5 - 1) * 2 ??? No.
        // 6-10: 22. 
        // 11-15: 24.
        // Formula: 22 + (cycles5 - 1) * 2
        // Let's check:
        // Years 6 -> cycles5 = 1 -> 22 + 0 = 22. Correct.
        // Years 11 -> cycles5 = 2 -> 22 + 2 = 24. Correct.
        // Years 16 -> cycles5 = 3 -> 22 + 4 = 26. Correct.
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
}
