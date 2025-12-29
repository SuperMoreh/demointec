import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MaterialsCatalogAdapterService } from '../../adapters/materials_catalog.adapter';
import { CategoriesAdapterService } from '../../adapters/categories.adapter';
import { SubcategoriesAdapterService } from '../../adapters/subcategories.adapter';
import { MaterialsCatalog } from '../../models/materials_catalog';
import { Category } from '../../models/categories';
import { Subcategory } from '../../models/subcategories';
import { ReportMaterialsService } from '../../services/reports/report_materials.service';

@Component({
  selector: 'app-materials-catalog',
  templateUrl: './materials-catalog.component.html',
  styleUrl: './materials-catalog.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class MaterialsCatalogComponent implements OnInit {
  materialsForm: FormGroup;
  isEditMode: boolean = false;
  photo: string | null = null;
  selectedImageFile: File | null = null;
  materials: MaterialsCatalog[] = [];
  allMaterials: MaterialsCatalog[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  selectedMaterial: MaterialsCatalog | null = null;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredMaterials: MaterialsCatalog[] = [];
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  filteredSubcategories: Subcategory[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private materialsAdapterService: MaterialsCatalogAdapterService,
    private categoriesAdapterService: CategoriesAdapterService,
    private subcategoriesAdapterService: SubcategoriesAdapterService,
    private reportMaterialsService: ReportMaterialsService
  ) {
    this.materialsForm = this.fb.group({
      name_material: ['', Validators.required],
      code: ['', Validators.required],
      c1: ['', Validators.required],
      c2: ['', Validators.required],
      image: [''],
      category: ['', Validators.required],
      subcategory: ['', Validators.required],
      unit: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubcategories();
    this.setCreateMode();
  }

  loadMaterials(): void {
    this.isLoading = true;
    this.materialsAdapterService.getList().subscribe({
      next: (data) => {
        this.allMaterials = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar materiales', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  consultMaterials(): void {
    this.hasConsulted = true;
    this.loadMaterials();
  }

  loadCategories(): void {
    this.categoriesAdapterService.getList().subscribe({
      next: (data) => {
        this.categories = data.filter(cat => cat.status === true);
        console.log('Categorías cargadas:', this.categories);
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
      }
    });
  }

  loadSubcategories(): void {
    this.subcategoriesAdapterService.getList().subscribe({
      next: (data) => {
        this.subcategories = data.filter(sub => sub.status === true);
        this.filteredSubcategories = this.subcategories;
        console.log('Subcategorías cargadas:', this.subcategories);
      },
      error: (err) => {
        console.error('Error al cargar subcategorías', err);
      }
    });
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredMaterials.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredMaterials.length);
    this.materials = this.filteredMaterials.slice(startIndex, endIndex);
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
    this.materialsForm.reset({
      name_material: '',
      code: '',
      c1: '',
      c2: '',
      image: '',
      category: '',
      subcategory: '',
      unit: '',
      status: true
    });
    this.photo = null;
    this.selectedImageFile = null;
    this.selectedMaterial = null;
    this.filteredSubcategories = this.subcategories;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.photo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  createMaterial(): void {
    if (this.materialsForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.materialsForm);
      return;
    }
    const materialData = {
      id_material: this.generateUUID(),
      name_material: this.materialsForm.value.name_material,
      code: this.materialsForm.value.code,
      c1: this.materialsForm.value.c1,
      c2: this.materialsForm.value.c2,
      image: this.photo ? this.photo : 'Sin foto',
      category: this.materialsForm.value.category,
      subcategory: this.materialsForm.value.subcategory,
      unit: this.materialsForm.value.unit,
      status: this.materialsForm.value.status
    };
    this.materialsAdapterService.post(materialData).subscribe({
      next: () => {
        this.toastr.success('Material creado correctamente', 'Éxito');
        this.setCreateMode();
        this.hasConsulted = true;
        this.loadMaterials();
        this.closeAddModal();
      },
      error: err => {
        console.error('Error al guardar material', err);
        this.toastr.error('Error al crear el material', 'Error');
      }
    });
  }

  viewMaterial(material: MaterialsCatalog): void {
    this.selectedMaterial = material;
    setTimeout(() => {
      const modal = document.getElementById('visualizarMaterial');
      if (modal) {
        const closeButton = modal.querySelector('.btn-close') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }
    }, 300);
  }

  openEditModal(material: MaterialsCatalog): void {
    this.isEditMode = true;
    this.selectedMaterial = material;
    this.photo = material.image;
    this.selectedImageFile = null;
    
    // Configurar las subcategorías filtradas basadas en la categoría del material
    if (material.category) {
      const category = this.categories.find(cat => cat.name_category === material.category);
      if (category) {
        this.filteredSubcategories = this.subcategories.filter(sub => sub.category_id === category.id_category);
      }
    }
    
    this.materialsForm.patchValue({
      name_material: material.name_material,
      code: material.code,
      c1: material.c1,
      c2: material.c2,
      image: material.image,
      category: material.category,
      subcategory: material.subcategory,
      unit: material.unit,
      status: material.status
    });
  }

  handleEditClick(material: MaterialsCatalog): void {
    this.openEditModal(material);
    const modal = document.getElementById('editarMaterialModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
      setTimeout(() => {
        const firstInput = modal.querySelector('input[formControlName="name_material"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  updateMaterial(): void {
    if (!this.selectedMaterial?.id_material) {
      this.toastr.error('No hay material seleccionado para editar', 'Error');
      return;
    }
    const nameControl = this.materialsForm.get('name_material');
    const codeControl = this.materialsForm.get('code');
    const c1Control = this.materialsForm.get('c1');
    const c2Control = this.materialsForm.get('c2');
    const categoryControl = this.materialsForm.get('category');
    const subcategoryControl = this.materialsForm.get('subcategory');
    const unitControl = this.materialsForm.get('unit');
    if (!nameControl?.value || !codeControl?.value || !c1Control?.value || !c2Control?.value || !categoryControl?.value || !subcategoryControl?.value || !unitControl?.value) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.materialsForm);
      return;
    }
    const materialId = this.selectedMaterial.id_material;
    const materialData: any = {
      name_material: this.materialsForm.value.name_material,
      code: this.materialsForm.value.code,
      c1: this.materialsForm.value.c1,
      c2: this.materialsForm.value.c2,
      image: this.selectedImageFile ? undefined : (this.photo ? this.photo : 'Sin foto'),
      category: this.materialsForm.value.category,
      subcategory: this.materialsForm.value.subcategory,
      unit: this.materialsForm.value.unit,
      status: this.materialsForm.value.status
    };
    if (this.selectedImageFile) {
      const formData = new FormData();
      formData.append('name_material', materialData.name_material);
      formData.append('code', materialData.code);
      formData.append('c1', materialData.c1);
      formData.append('c2', materialData.c2);
      formData.append('category', materialData.category);
      formData.append('subcategory', materialData.subcategory);
      formData.append('unit', materialData.unit);
      formData.append('status', String(materialData.status));
      formData.append('image', this.selectedImageFile);
      this.materialsAdapterService.put(materialId, formData).subscribe({
        next: () => {
          this.toastr.success('Material actualizado correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadMaterials();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: err => {
          console.error('Error al actualizar material:', err);
          this.toastr.error('Error al actualizar el material', 'Error');
        }
      });
    } else {
      if (!materialData.image) materialData.image = 'Sin foto';
      this.materialsAdapterService.put(materialId, materialData).subscribe({
        next: () => {
          this.toastr.success('Material actualizado correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadMaterials();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: err => {
          console.error('Error al actualizar material:', err);
          this.toastr.error('Error al actualizar el material', 'Error');
        }
      });
    }
  }

  deleteMaterial(material: MaterialsCatalog): void {
    console.log('Material a eliminar:', material);
    if (!material.id_material) {
      this.toastr.error('No se puede eliminar el material: ID no válido', 'Error');
      return;
    }
    if (confirm(`¿Está seguro que desea eliminar el material "${material.name_material}"?`)) {
      this.materialsAdapterService.delete(material.id_material).subscribe({
        next: () => {
          this.toastr.success('Material eliminado correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadMaterials();
        },
        error: err => {
          console.error('Error al eliminar material:', err);
          this.toastr.error('Error al eliminar el material', 'Error');
        }
      });
    }
  }

  applyFilters(): void {
    if (!this.hasConsulted) {
      return;
    }
    this.filteredMaterials = this.allMaterials.filter(mat => {
      const searchMatch = !this.searchTerm ||
        mat.name_material.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mat.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mat.c1.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mat.c2.toLowerCase().includes(this.searchTerm.toLowerCase());
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = mat.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = mat.status === false;
      } else {
        statusMatch = mat.status === true;
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
    this.filteredMaterials = this.allMaterials.filter(mat => mat.status === true);
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
    this.closeModal('agregarMaterialModal');
  }

  closeEditModal(): void {
    this.closeModal('editarMaterialModal');
  }

  closeViewModal(): void {
    this.closeModal('visualizarMaterial');
  }

  async exportMaterials(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const materialsToExport = this.filteredMaterials;
      await this.reportMaterialsService.generateMaterialsReport(materialsToExport, 'CATÁLOGO DE MATERIALES');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

  syncFromFirebase(): void {
    this.isLoading = true;
    this.materialsAdapterService.syncToFirebase().subscribe({
      next: (res) => {
        this.toastr.success('Sincronización completada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadMaterials();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Error al sincronizar desde Firebase', 'Error');
        console.error(err);
      }
    });
  }

  syncMaterials(): void {
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

  onCategoryChange(): void {
    const selectedCategory = this.materialsForm.get('category')?.value;
    console.log('Categoría seleccionada:', selectedCategory);
    console.log('Todas las subcategorías:', this.subcategories);
    
    if (selectedCategory) {
      // Buscar la categoría por nombre para obtener su ID
      const category = this.categories.find(cat => cat.name_category === selectedCategory);
      if (category) {
        this.filteredSubcategories = this.subcategories.filter(sub => sub.category_id === category.id_category);
        console.log('Subcategorías filtradas:', this.filteredSubcategories);
      } else {
        this.filteredSubcategories = [];
      }
    } else {
      this.filteredSubcategories = this.subcategories;
    }
    // Limpiar subcategoría seleccionada cuando cambia la categoría
    this.materialsForm.patchValue({ subcategory: '' });
  }
} 