import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AttendancesAdapterService } from '../../adapters/attendances.adapter';
import { Attendance } from '../../models/attendances';
import { ReportAttendancesService } from '../../services/reports/report_attendances.service';

@Component({
  selector: 'app-attendances',
  templateUrl: './attendances.component.html',
  styleUrl: './attendances.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class AttendancesComponent implements OnInit {
  attendances: Attendance[] = [];
  allAttendances: Attendance[] = [];
  filteredAttendances: Attendance[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  periodType: string = 'dia';
  startDate: string = '';
  endDate: string = '';
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private toastr: ToastrService,
    private attendancesAdapterService: AttendancesAdapterService,
    private reportAttendancesService: ReportAttendancesService
  ) {}

  ngOnInit(): void {
    this.onPeriodTypeChange();
  }

  loadAttendances(): void {
    this.isLoading = true;
    this.attendancesAdapterService.getList().subscribe({
      next: (data) => {
        this.allAttendances = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Error al cargar asistencias', 'Error');
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  consultAttendances(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.warning('Selecciona un rango de fechas antes de consultar', 'Atención');
      return;
    }
    this.hasConsulted = true;
    this.loadAttendances();
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredAttendances.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredAttendances.length);
    this.attendances = this.filteredAttendances.slice(startIndex, endIndex);
    this.updatePaginationButtons();
  }

  updatePaginationButtons(): void {
    if (this.totalPages === 0) {
      this.pages = [];
      return;
    }
    const currentPageGroup = Math.ceil(this.currentPage / this.maxPagesToShow);
    let startPage = (currentPageGroup - 1) * this.maxPagesToShow + 1;
    let endPage = Math.min(startPage + this.maxPagesToShow - 1, this.totalPages);
    this.pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  }

  applyFilters(): void {
    let filtered = this.allAttendances;
    if (this.searchTerm) {
      filtered = filtered.filter(att => att.name_user.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      filtered = filtered.filter(att => {
        const attDate = new Date(att.date);
        return attDate >= start && attDate <= end;
      });
    }
    this.filteredAttendances = filtered;
    this.setPage(1);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.periodType = 'dia';
    this.startDate = '';
    this.endDate = '';
    if (this.hasConsulted) {
      this.filteredAttendances = this.allAttendances;
      this.setPage(1);
    }
  }

  syncAttendances(): void {
    this.attendancesAdapterService.syncToFirebase().subscribe({
      next: () => {
        this.toastr.success('Sincronización completada correctamente', 'Éxito');
        this.loadAttendances();
      },
      error: (err) => {
        this.toastr.error('Error al sincronizar desde Firebase', 'Error');
        console.error(err);
      }
    });
  }

  onPeriodTypeChange(): void {
    const today = new Date();
    if (this.periodType === 'dia') {
      this.startDate = this.formatDate(today);
      this.endDate = this.formatDate(today);
    } else if (this.periodType === 'semana') {
      const first = today.getDate() - today.getDay();
      const last = first + 6;
      const firstDay = new Date(today.setDate(first));
      const lastDay = new Date(today.setDate(last));
      this.startDate = this.formatDate(firstDay);
      this.endDate = this.formatDate(lastDay);
    } else if (this.periodType === 'mes') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      this.startDate = this.formatDate(firstDay);
      this.endDate = this.formatDate(lastDay);
    }
    this.applyFilters();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async exportAttendances(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const attendancesToExport = this.filteredAttendances;
      await this.reportAttendancesService.generateAttendancesReport(attendancesToExport, 'REPORTE DE ASISTENCIAS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }
} 