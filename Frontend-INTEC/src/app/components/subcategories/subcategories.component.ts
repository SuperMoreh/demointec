import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubcategoriesAdapterService } from '../../adapters/subcategories.adapter';
import { CategoriesAdapterService } from '../../adapters/categories.adapter';
import { Subcategory } from '../../models/subcategories';
import { Category } from '../../models/categories';
import { ReportSubcategoriesService } from '../../services/reports/report_subcategories.service';

@Component({
  selector: 'app-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class SubcategoriesComponent implements OnInit {
  subcategoriesForm: FormGroup;
  isEditMode: boolean = false;
  selectedSubcategory: Subcategory | null = null;
  subcategories: Subcategory[] = [];
  allSubcategories: Subcategory[] = [];
  categories: Category[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredSubcategories: Subcategory[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private subcategoriesAdapterService: SubcategoriesAdapterService,
    private categoriesAdapterService: CategoriesAdapterService,
    private reportSubcategoriesService: ReportSubcategoriesService
  ) {
    this.subcategoriesForm = this.fb.group({
      name_subcategory: ['', Validators.required],
      c1: ['', Validators.required],
      c2: ['', Validators.required],
      category_id: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setCreateMode();
  }

  loadSubcategories(): void {
    this.isLoading = true;
    this.subcategoriesAdapterService.getList().subscribe({
      next: (data) => {
        this.allSubcategories = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar subpartidas', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  consultSubcategories(): void {
    this.hasConsulted = true;
    this.loadSubcategories();
  }

  loadCategories(): void {
    this.categoriesAdapterService.getList().subscribe({
      next: (data) => {
        this.categories = data.filter(cat => cat.status === true);
      },
      error: (err) => {
        console.error('Error al cargar partidas', err);
      }
    });
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredSubcategories.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredSubcategories.length);
    this.subcategories = this.filteredSubcategories.slice(startIndex, endIndex);
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
    this.subcategoriesForm.reset({
      name_subcategory: '',
      c1: '',
      c2: '',
      category_id: '',
      status: true
    });
    this.selectedSubcategory = null;
  }

  createSubcategory(): void {
    if (this.subcategoriesForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.subcategoriesForm);
      return;
    }
    const subcategoryData = {
      id_subcategory: this.generateUUID(),
      name_subcategory: this.subcategoriesForm.value.name_subcategory,
      c1: this.subcategoriesForm.value.c1,
      c2: this.subcategoriesForm.value.c2,
      category_id: this.subcategoriesForm.value.category_id,
      status: this.subcategoriesForm.value.status
    };
    this.subcategoriesAdapterService.post(subcategoryData).subscribe({
      next: () => {
        this.toastr.success('Subpartida creada correctamente', 'Éxito');
        this.setCreateMode();
        this.hasConsulted = true;
        this.loadSubcategories();
        this.closeAddModal();
      },
      error: err => {
        console.error('Error al guardar subpartida', err);
        this.toastr.error('Error al crear la subpartida', 'Error');
      }
    });
  }

  openEditModal(subcategory: Subcategory): void {
    this.isEditMode = true;
    this.selectedSubcategory = subcategory;
    this.subcategoriesForm.patchValue({
      name_subcategory: subcategory.name_subcategory,
      c1: subcategory.c1,
      c2: subcategory.c2,
      category_id: subcategory.category_id,
      status: subcategory.status
    });
  }

  handleEditClick(subcategory: Subcategory): void {
    this.openEditModal(subcategory);
    const modal = document.getElementById('editarSubpartidaModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
      setTimeout(() => {
        const firstInput = modal.querySelector('input[formControlName="name_subcategory"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  updateSubcategory(): void {
    if (!this.selectedSubcategory?.id_subcategory) {
      this.toastr.error('No hay subpartida seleccionada para editar', 'Error');
      return;
    }
    const nameControl = this.subcategoriesForm.get('name_subcategory');
    const c1Control = this.subcategoriesForm.get('c1');
    const c2Control = this.subcategoriesForm.get('c2');
    const categoryControl = this.subcategoriesForm.get('category_id');
    if (!nameControl?.value || !c1Control?.value || !c2Control?.value || !categoryControl?.value) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.subcategoriesForm);
      return;
    }
    const subcategoryId = this.selectedSubcategory.id_subcategory;
    const subcategoryData: any = {
      name_subcategory: this.subcategoriesForm.value.name_subcategory,
      c1: this.subcategoriesForm.value.c1,
      c2: this.subcategoriesForm.value.c2,
      category_id: this.subcategoriesForm.value.category_id,
      status: this.subcategoriesForm.value.status
    };
    this.subcategoriesAdapterService.put(subcategoryId, subcategoryData).subscribe({
      next: () => {
        this.toastr.success('Subpartida actualizada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadSubcategories();
        this.closeEditModal();
        this.setCreateMode();
      },
      error: err => {
        console.error('Error al actualizar subpartida:', err);
        this.toastr.error('Error al actualizar la subpartida', 'Error');
      }
    });
  }

  deleteSubcategory(subcategory: Subcategory): void {
    if (!subcategory.id_subcategory) {
      this.toastr.error('No se puede eliminar la subpartida: ID no válido', 'Error');
      return;
    }
    if (confirm(`¿Está seguro que desea eliminar la subpartida "${subcategory.name_subcategory}"?`)) {
      this.subcategoriesAdapterService.delete(subcategory.id_subcategory).subscribe({
        next: () => {
          this.toastr.success('Subpartida eliminada correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadSubcategories();
        },
        error: err => {
          console.error('Error al eliminar subpartida:', err);
          this.toastr.error('Error al eliminar la subpartida', 'Error');
        }
      });
    }
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id_category === categoryId);
    return category ? category.name_category : 'N/A';
  }

  applyFilters(): void {
    if (!this.hasConsulted) {
      return;
    }
    this.filteredSubcategories = this.allSubcategories.filter(sub => {
      const searchMatch = !this.searchTerm ||
        sub.name_subcategory.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sub.c1.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sub.c2.toLowerCase().includes(this.searchTerm.toLowerCase());
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = sub.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = sub.status === false;
      } else {
        statusMatch = sub.status === true;
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
    this.filteredSubcategories = this.allSubcategories.filter(sub => sub.status === true);
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
    this.closeModal('agregarSubpartidaModal');
  }

  closeEditModal(): void {
    this.closeModal('editarSubpartidaModal');
  }

  async exportSubcategories(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const subcategoriesToExport = this.filteredSubcategories;
      await this.reportSubcategoriesService.generateSubcategoriesReport(subcategoriesToExport, this.categories, 'CATÁLOGO DE SUBPARTIDAS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

  syncFromFirebase(): void {
    this.isLoading = true;
    this.subcategoriesAdapterService.syncToFirebase().subscribe({
      next: (res) => {
        this.toastr.success('Sincronización completada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadSubcategories();
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

  syncSubcategories(): void {
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