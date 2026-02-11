import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmployeeProjectAdapterService } from '../../adapters/employee-project.adapter';
import { EmployeeProject } from '../../models/employee-project';
import { ProjectsCatalogAdapterService } from '../../adapters/projects_catalog.adapter';
import { Project } from '../../models/projects_catalog';
import { ReportEmployeeProjectService } from '../../services/reports/report_employee_project.service';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { Employee } from '../../models/employees';

@Component({
  selector: 'app-employee-project',
  templateUrl: './employee-project.component.html',
  styleUrl: './employee-project.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class EmployeeProjectComponent implements OnInit {
  employeeProjectForm: FormGroup;
  assignProjectForm: FormGroup;
  selectedEmployeeProject: EmployeeProject | null = null;
  employeeProjects: EmployeeProject[] = [];
  allEmployeeProjects: EmployeeProject[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredEmployeeProjects: EmployeeProject[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  projects: Project[] = [];
  employees: Employee[] = [];
  addProjectForm: FormGroup;
  locationOptions: string[] = ['Local', 'Foránea'];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private employeeProjectAdapterService: EmployeeProjectAdapterService,
    private projectsCatalogAdapterService: ProjectsCatalogAdapterService,
    private reportEmployeeProjectService: ReportEmployeeProjectService,
    private employeesAdapterService: EmployeesAdapterService
  ) {
    this.employeeProjectForm = this.fb.group({
      project: ['', Validators.required]
    });

    this.assignProjectForm = this.fb.group({
      project: ['', Validators.required]
    });

    this.addProjectForm = this.fb.group({
      name_project: ['', Validators.required],
      locationType: ['', Validators.required],
      locality: ['', Validators.required],
      official: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadEmployees();
  }

  loadProjects(): void {
    this.projectsCatalogAdapterService.getList().subscribe({
      next: (data) => {
        this.projects = data.filter(p => p.status === true);
      },
      error: (err) => console.error('Error al cargar obras', err)
    });
  }

  loadEmployeeProjects(): void {
    this.isLoading = true;
    this.employeeProjectAdapterService.getList().subscribe({
      next: (data) => {
        this.allEmployeeProjects = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar colaboradores', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  consultEmployeeProjects(): void {
    this.hasConsulted = true;
    this.loadEmployeeProjects();
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredEmployeeProjects.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredEmployeeProjects.length);
    this.employeeProjects = this.filteredEmployeeProjects.slice(startIndex, endIndex);
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
    if (!this.hasConsulted) {
      return;
    }
    this.filteredEmployeeProjects = this.allEmployeeProjects.filter(item => {
      const searchMatch = !this.searchTerm ||
        item.name_employee.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (item.project && item.project.toLowerCase().includes(this.searchTerm.toLowerCase()));
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = item.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = item.status === false;
      } else {
        statusMatch = item.status === true;
      }
      return searchMatch && statusMatch;
    });
    this.setPage(1);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    if (!this.hasConsulted) {
      return;
    }
    this.filteredEmployeeProjects = this.allEmployeeProjects.filter(item => item.status === true);
    this.setPage(1);
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.selectedStatus !== '';
  }

  openEditModal(item: EmployeeProject): void {
    this.selectedEmployeeProject = item;
    this.employeeProjectForm.patchValue({
      project: item.project || ''
    });
  }

  handleEditClick(item: EmployeeProject): void {
    this.openEditModal(item);
    const modal = document.getElementById('editarObraModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  updateEmployeeProject(): void {
    if (!this.selectedEmployeeProject?.id_employee) {
      this.toastr.error('No hay colaborador seleccionado para editar', 'Error');
      return;
    }
    if (this.employeeProjectForm.invalid) {
      this.toastr.error('Seleccione una obra', 'Advertencia');
      return;
    }
    const data: EmployeeProject = {
      ...this.selectedEmployeeProject,
      project: this.employeeProjectForm.value.project
    };
    this.employeeProjectAdapterService.put(this.selectedEmployeeProject.id_employee, data).subscribe({
      next: () => {
        this.toastr.success('Obra actualizada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadEmployeeProjects();
        this.closeEditModal();
      },
      error: err => {
        console.error('Error al actualizar obra:', err);
        this.toastr.error('Error al actualizar la obra', 'Error');
      }
    });
  }

  openAssignModal(item: EmployeeProject): void {
    this.selectedEmployeeProject = item;
    this.assignProjectForm.reset({ project: '' });
  }

  handleAssignClick(item: EmployeeProject): void {
    this.openAssignModal(item);
    const modal = document.getElementById('asignarObraModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  assignProject(): void {
    if (!this.selectedEmployeeProject?.id_employee) {
      this.toastr.error('No hay colaborador seleccionado', 'Error');
      return;
    }
    if (this.assignProjectForm.invalid) {
      this.toastr.error('Seleccione una obra', 'Advertencia');
      return;
    }
    const data: EmployeeProject = {
      ...this.selectedEmployeeProject,
      project: this.assignProjectForm.value.project
    };
    this.employeeProjectAdapterService.put(this.selectedEmployeeProject.id_employee, data).subscribe({
      next: () => {
        this.toastr.success('Obra asignada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadEmployeeProjects();
        this.closeAssignModal();
      },
      error: err => {
        console.error('Error al asignar obra:', err);
        this.toastr.error('Error al asignar la obra', 'Error');
      }
    });
  }

  deleteEmployeeProject(item: EmployeeProject): void {
    if (!item.id_employee) {
      this.toastr.error('No se puede eliminar: ID no válido', 'Error');
      return;
    }
    if (confirm(`¿Quieres eliminar la obra "${item.project}" ?`)) {
      this.employeeProjectAdapterService.delete(item.id_employee).subscribe({
        next: () => {
          this.toastr.success('Obra eliminada correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadEmployeeProjects();
        },
        error: err => {
          console.error('Error al eliminar obra:', err);
          this.toastr.error('Error al eliminar la obra', 'Error');
        }
      });
    }
  }

  async exportEmployeeProjects(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const dataToExport = this.filteredEmployeeProjects;
      await this.reportEmployeeProjectService.generateEmployeeProjectReport(dataToExport, 'ASIGNACIÓN DE OBRAS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.blur();
        }
        bootstrapModal.hide();
      }
    }
  }

  closeEditModal(): void {
    this.closeModal('editarObraModal');
  }

  closeAssignModal(): void {
    this.closeModal('asignarObraModal');
  }

  loadEmployees(): void {
    this.employeesAdapterService.getList().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => console.error('Error al cargar empleados', err)
    });
  }

  openAddProjectModal(): void {
    this.addProjectForm.reset({
      name_project: '',
      locationType: '',
      locality: '',
      official: '',
      status: true
    });
    const modal = document.getElementById('agregarObraModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  createProject(): void {
    if (this.addProjectForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.addProjectForm);
      return;
    }
    const projectData = {
      id_project: this.generateUUID(),
      name_project: this.addProjectForm.value.name_project,
      locationType: this.addProjectForm.value.locationType,
      locality: this.addProjectForm.value.locality,
      official: this.addProjectForm.value.official,
      status: this.addProjectForm.value.status
    };
    this.projectsCatalogAdapterService.post(projectData).subscribe({
      next: () => {
        this.toastr.success('Obra creada correctamente', 'Éxito');
        this.closeAddProjectModal();
        this.loadProjects();
      },
      error: err => {
        console.error('Error al crear obra', err);
        this.toastr.error('Error al crear la obra', 'Error');
      }
    });
  }

  closeAddProjectModal(): void {
    this.closeModal('agregarObraModal');
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
