import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryReportAdapterService } from '../../adapters/salary-report.adapter';
import { SalaryReport } from '../../models/salary-report';

@Component({
  selector: 'app-salary-report',
  templateUrl: './salary-report.component.html',
  styleUrl: './salary-report.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class SalaryReportComponent implements OnInit {
  private adapter = inject(SalaryReportAdapterService);

  records: SalaryReport[] = [];
  filteredRecords: SalaryReport[] = [];

  searchTerm: string = '';
  incrementPercent: number | null = null;
  isLoading: boolean = false;
  hasConsulted: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pages: number[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.hasConsulted = true;
    this.adapter.getList().subscribe({
      next: (data) => {
        this.records = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredRecords = term
      ? this.records.filter(r =>
          r.name_employee?.toLowerCase().includes(term) ||
          r.position?.toLowerCase().includes(term)
        )
      : [...this.records];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRecords.length / this.itemsPerPage) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedRecords(): SalaryReport[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  calcIncrement(salary: number): number | null {
    if (this.incrementPercent === null || this.incrementPercent === 0) return null;
    return salary * (this.incrementPercent / 100);
  }
}
