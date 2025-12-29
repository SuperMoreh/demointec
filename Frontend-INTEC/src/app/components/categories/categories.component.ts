import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CategoriesAdapterService } from '../../adapters/categories.adapter';
import { Category } from '../../models/categories';
import { ReportCategoriesService } from '../../services/reports/report_categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class CategoriesComponent implements OnInit {
  categoriesForm: FormGroup;
  isEditMode: boolean = false;
  selectedCategory: Category | null = null;
  categories: Category[] = [];
  allCategories: Category[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredCategories: Category[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private categoriesAdapterService: CategoriesAdapterService,
    private reportCategoriesService: ReportCategoriesService
  ) {
    this.categoriesForm = this.fb.group({
      name_category: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.setCreateMode();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoriesAdapterService.getList().subscribe({
      next: (data) => {
        this.allCategories = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar partidas', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  consultCategories(): void {
    this.hasConsulted = true;
    this.loadCategories();
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredCategories.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredCategories.length);
    this.categories = this.filteredCategories.slice(startIndex, endIndex);
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
    this.categoriesForm.reset({
      name_category: '',
      status: true
    });
    this.selectedCategory = null;
  }

  createCategory(): void {
    if (this.categoriesForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.categoriesForm);
      return;
    }
    const categoryData = {
      id_category: this.generateUUID(),
      name_category: this.categoriesForm.value.name_category,
      status: this.categoriesForm.value.status
    };
    this.categoriesAdapterService.post(categoryData).subscribe({
      next: () => {
        this.toastr.success('Partida creada correctamente', 'Éxito');
        this.setCreateMode();
        this.hasConsulted = true;
        this.loadCategories();
        this.closeAddModal();
      },
      error: err => {
        console.error('Error al guardar partida', err);
        this.toastr.error('Error al crear la partida', 'Error');
      }
    });
  }

  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.selectedCategory = category;
    this.categoriesForm.patchValue({
      name_category: category.name_category,
      status: category.status
    });
  }

  handleEditClick(category: Category): void {
    this.openEditModal(category);
    const modal = document.getElementById('editarPartidaModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
      setTimeout(() => {
        const firstInput = modal.querySelector('input[formControlName="name_category"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  updateCategory(): void {
    if (!this.selectedCategory?.id_category) {
      this.toastr.error('No hay partida seleccionada para editar', 'Error');
      return;
    }
    const nameControl = this.categoriesForm.get('name_category');
    if (!nameControl?.value) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.categoriesForm);
      return;
    }
    const categoryId = this.selectedCategory.id_category;
    const categoryData: any = {
      name_category: this.categoriesForm.value.name_category,
      status: this.categoriesForm.value.status
    };
    this.categoriesAdapterService.put(categoryId, categoryData).subscribe({
      next: () => {
        this.toastr.success('Partida actualizada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadCategories();
        this.closeEditModal();
        this.setCreateMode();
      },
      error: err => {
        console.error('Error al actualizar partida:', err);
        this.toastr.error('Error al actualizar la partida', 'Error');
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!category.id_category) {
      this.toastr.error('No se puede eliminar la partida: ID no válido', 'Error');
      return;
    }
    if (confirm(`¿Está seguro que desea eliminar la partida "${category.name_category}"?`)) {
      this.categoriesAdapterService.delete(category.id_category).subscribe({
        next: () => {
          this.toastr.success('Partida eliminada correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadCategories();
        },
        error: err => {
          console.error('Error al eliminar partida:', err);
          this.toastr.error('Error al eliminar la partida', 'Error');
        }
      });
    }
  }

  applyFilters(): void {
    if (!this.hasConsulted) {
      return;
    }
    this.filteredCategories = this.allCategories.filter(cat => {
      const searchMatch = !this.searchTerm ||
        cat.name_category.toLowerCase().includes(this.searchTerm.toLowerCase());
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = cat.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = cat.status === false;
      } else {
        statusMatch = cat.status === true;
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
    this.filteredCategories = this.allCategories.filter(cat => cat.status === true);
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
    this.closeModal('agregarPartidaModal');
  }

  closeEditModal(): void {
    this.closeModal('editarPartidaModal');
  }

  async exportCategories(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const categoriesToExport = this.filteredCategories;
      await this.reportCategoriesService.generateCategoriesReport(categoriesToExport, 'CATÁLOGO DE PARTIDAS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

  syncFromFirebase(): void {
    this.isLoading = true;
    this.categoriesAdapterService.syncToFirebase().subscribe({
      next: (res) => {
        this.toastr.success('Sincronización completada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadCategories();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Error al sincronizar desde Firebase', 'Error');
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  syncCategories(): void {
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