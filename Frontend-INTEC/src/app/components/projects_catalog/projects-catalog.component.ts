import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectsCatalogAdapterService } from '../../adapters/projects_catalog.adapter';
import { Project } from '../../models/projects_catalog';
import { ReportProjectsService } from '../../services/reports/report_projects.service';

@Component({
  selector: 'app-projects-catalog',
  templateUrl: './projects-catalog.component.html',
  styleUrl: './projects-catalog.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class ProjectsCatalogComponent implements OnInit {
  projectsForm: FormGroup;
  isEditMode: boolean = false;
  selectedProject: Project | null = null;
  projects: Project[] = [];
  allProjects: Project[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredProjects: Project[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private projectsAdapterService: ProjectsCatalogAdapterService,
    private reportProjectsService: ReportProjectsService
  ) {
    this.projectsForm = this.fb.group({
      name_project: ['', Validators.required],
      locationType: ['', Validators.required],
      locality: ['', Validators.required],
      official: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.setCreateMode();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectsAdapterService.getList().subscribe({
      next: (data) => {
        this.allProjects = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar proyectos', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  consultProjects(): void {
    this.hasConsulted = true;
    this.loadProjects();
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredProjects.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredProjects.length);
    this.projects = this.filteredProjects.slice(startIndex, endIndex);
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

  setCreateMode(): void {
    this.isEditMode = false;
    this.projectsForm.reset({
      name_project: '',
      locationType: '',
      locality: '',
      official: '',
      status: true
    });
    this.selectedProject = null;
  }

  createProject(): void {
    if (this.projectsForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.projectsForm);
      return;
    }
    const projectData = {
      id_project: this.generateUUID(),
      name_project: this.projectsForm.value.name_project,
      locationType: this.projectsForm.value.locationType,
      locality: this.projectsForm.value.locality,
      official: this.projectsForm.value.official,
      status: this.projectsForm.value.status
    };
    this.projectsAdapterService.post(projectData).subscribe({
      next: () => {
        this.toastr.success('Proyecto creado correctamente', 'Éxito');
        this.setCreateMode();
        this.hasConsulted = true;
        this.loadProjects();
        this.closeAddModal();
      },
      error: err => {
        console.error('Error al guardar proyecto', err);
        this.toastr.error('Error al crear el proyecto', 'Error');
      }
    });
  }

  viewProject(project: Project): void {
    this.selectedProject = project;
    setTimeout(() => {
      const modal = document.getElementById('visualizarProyecto');
      if (modal) {
        const closeButton = modal.querySelector('.btn-close') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }
    }, 300);
  }

  openEditModal(project: Project): void {
    this.isEditMode = true;
    this.selectedProject = project;
    this.projectsForm.patchValue({
      name_project: project.name_project,
      locationType: project.locationType,
      locality: project.locality,
      official: project.official,
      status: project.status
    });
  }

  handleEditClick(project: Project): void {
    this.openEditModal(project);
    const modal = document.getElementById('editarProyectoModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
      setTimeout(() => {
        const firstInput = modal.querySelector('input[formControlName="name_project"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  updateProject(): void {
    if (!this.selectedProject?.id_project) {
      this.toastr.error('No hay proyecto seleccionado para editar', 'Error');
      return;
    }
    const nameControl = this.projectsForm.get('name_project');
    const locationTypeControl = this.projectsForm.get('locationType');
    const localityControl = this.projectsForm.get('locality');
    const officialControl = this.projectsForm.get('official');
    if (!nameControl?.value || !locationTypeControl?.value || !localityControl?.value || !officialControl?.value) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.projectsForm);
      return;
    }
    const projectId = this.selectedProject.id_project;
    const projectData: any = {
      name_project: this.projectsForm.value.name_project,
      locationType: this.projectsForm.value.locationType,
      locality: this.projectsForm.value.locality,
      official: this.projectsForm.value.official,
      status: this.projectsForm.value.status
    };
    this.projectsAdapterService.put(projectId, projectData).subscribe({
      next: () => {
        this.toastr.success('Proyecto actualizado correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadProjects();
        this.closeEditModal();
        this.setCreateMode();
      },
      error: err => {
        console.error('Error al actualizar proyecto:', err);
        this.toastr.error('Error al actualizar el proyecto', 'Error');
      }
    });
  }

  deleteProject(project: Project): void {
    if (!project.id_project) {
      this.toastr.error('No se puede eliminar el proyecto: ID no válido', 'Error');
      return;
    }
    if (confirm(`¿Está seguro que desea eliminar el proyecto "${project.name_project}"?`)) {
      this.projectsAdapterService.delete(project.id_project).subscribe({
        next: () => {
          this.toastr.success('Proyecto eliminado correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadProjects();
        },
        error: err => {
          console.error('Error al eliminar proyecto:', err);
          this.toastr.error('Error al eliminar el proyecto', 'Error');
        }
      });
    }
  }

  applyFilters(): void {
    if (!this.hasConsulted) {
      return;
    }
    this.filteredProjects = this.allProjects.filter(proj => {
      const searchMatch = !this.searchTerm ||
        proj.name_project.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        proj.locationType.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        proj.locality.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        proj.official.toLowerCase().includes(this.searchTerm.toLowerCase());
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = proj.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = proj.status === false;
      } else {
        statusMatch = proj.status === true;
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
    this.filteredProjects = this.allProjects.filter(proj => proj.status === true);
    this.setPage(1);
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.selectedStatus !== '';
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

  closeAddModal(): void {
    this.closeModal('agregarProyectoModal');
  }

  closeEditModal(): void {
    this.closeModal('editarProyectoModal');
  }

  closeViewModal(): void {
    this.closeModal('visualizarProyecto');
  }

  async exportProjects(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const projectsToExport = this.filteredProjects;
      await this.reportProjectsService.generateProjectsReport(projectsToExport, 'CATÁLOGO DE OBRAS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

  syncFromFirebase(): void {
    this.isLoading = true;
    this.projectsAdapterService.syncToFirebase().subscribe({
      next: (res) => {
        this.toastr.success('Sincronización completada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadProjects();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Error al sincronizar desde Firebase', 'Error');
        console.error(err);
      }
    });
  }

  syncProjects(): void {
    this.syncFromFirebase();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
} 