import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrenominaAdapterService } from '../../adapters/prenomina.adapter';
import { ProjectsCatalogAdapterService } from '../../adapters/projects_catalog.adapter';
import { Prenomina } from '../../models/prenomina';
import { Project } from '../../models/projects_catalog';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../../services/errror.services';
import { ReportPrenominaService } from '../../services/reports/report_prenomina.service';

interface PrenominaGroup {
  project: string;
  employees: Prenomina[];
}

@Component({
  selector: 'app-prenomina',
  templateUrl: './prenomina.component.html',
  styleUrl: './prenomina.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class PrenominaComponent implements OnInit {
  private prenominaAdapter = inject(PrenominaAdapterService);
  private projectsAdapter = inject(ProjectsCatalogAdapterService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private errorService = inject(ErrorService);
  private reportService = inject(ReportPrenominaService);
  private destroyRef = inject(DestroyRef);

  filterForm: FormGroup;
  projects: Project[] = [];
  allPrenominas: Prenomina[] = [];
  filteredPrenominas: Prenomina[] = [];
  groupedPrenominas: PrenominaGroup[] = [];
  prenominas: Prenomina[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 40;
  searchTerm: string = '';
  selectedProject: string = '';
  hasConsulted: boolean = false;
  isLoading: boolean = false;
  isMultiDay: boolean = false;

  constructor() {
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectsAdapter.getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.projects = data.filter(p => p.status);
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
        }
      });
  }

  consultPrenominas(): void {
    if (this.filterForm.invalid) {
      this.toastr.warning('Seleccione fecha inicial y fecha final', 'Advertencia');
      return;
    }

    const { startDate, endDate } = this.filterForm.value;

    if (startDate > endDate) {
      this.toastr.warning('La fecha inicial no puede ser mayor a la fecha final', 'Advertencia');
      return;
    }

    this.isMultiDay = startDate !== endDate;
    this.isLoading = true;
    this.hasConsulted = true;

    this.prenominaAdapter.getList(startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.allPrenominas = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    if (!this.hasConsulted) return;

    this.filteredPrenominas = this.allPrenominas.filter(item => {
      const searchMatch = !this.searchTerm ||
        item.name_employee.toLowerCase().includes(this.searchTerm.toLowerCase());
      const projectMatch = !this.selectedProject ||
        item.project === this.selectedProject;
      return searchMatch && projectMatch;
    });

    this.buildGroups();
    this.setPage(1);
  }

  buildGroups(): void {
    const map = new Map<string, Prenomina[]>();

    for (const item of this.filteredPrenominas) {
      const key = item.project || 'Sin Obra';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    this.groupedPrenominas = Array.from(map.entries()).map(([project, employees]) => ({
      project,
      employees
    }));
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredPrenominas.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredPrenominas.length);
    this.prenominas = this.filteredPrenominas.slice(startIndex, endIndex);
    this.buildPaginatedGroups();
    this.updatePaginationButtons();
  }

  buildPaginatedGroups(): void {
    const map = new Map<string, Prenomina[]>();

    for (const item of this.prenominas) {
      const key = item.project || 'Sin Obra';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    this.groupedPrenominas = Array.from(map.entries()).map(([project, employees]) => ({
      project,
      employees
    }));
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

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedProject = '';
    if (!this.hasConsulted) return;
    this.filteredPrenominas = [...this.allPrenominas];
    this.buildGroups();
    this.setPage(1);
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.selectedProject !== '';
  }

  exportToExcel(): void {
    if (!this.filteredPrenominas || this.filteredPrenominas.length === 0) {
      this.toastr.warning('No hay datos para exportar', 'Advertencia');
      return;
    }
    const { startDate, endDate } = this.filterForm.value;
    this.reportService.exportToExcel(this.filteredPrenominas, this.isMultiDay, startDate, endDate);
  }
}
