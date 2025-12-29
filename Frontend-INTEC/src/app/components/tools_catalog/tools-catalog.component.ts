import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ErrorService } from '../../services/errror.services';
import { ToastrService } from 'ngx-toastr';
import { ToolsCatalogAdapterService } from '../../adapters/tools_catalog.adapter';
import { ToolsCatalog } from '../../models/tools_catalog';
import { ReportsToolsService } from '../../services/reports/reports_tools.service';

@Component({
  selector: 'app-tools-catalog',
  templateUrl: './tools-catalog.component.html',
  styleUrl: './tools-catalog.component.css',
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, FormsModule 
  ]
})
export class ToolsCatalogComponent implements OnInit {
  toolsForm: FormGroup;
  isEditMode: boolean = false;
  photo: string | null = null;
  selectedImageFile: File | null = null;
  tools: ToolsCatalog[] = [];
  allTools: ToolsCatalog[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  selectedTool: ToolsCatalog | null = null;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredTools: ToolsCatalog[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private errorService: ErrorService, private toastr: ToastrService, private toolsAdapterService: ToolsCatalogAdapterService, private reportsToolsService: ReportsToolsService) {
    this.toolsForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.setCreateMode();
  }

  loadTools(): void {
    this.isLoading = true;
    this.toolsAdapterService.getList().subscribe({
      next: (data) => {
        this.allTools = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar herramientas', err);
      }
    });
  }

  consultTools(): void {
    this.hasConsulted = true;
    this.loadTools();
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredTools.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    
    this.currentPage = page;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredTools.length);
    this.tools = this.filteredTools.slice(startIndex, endIndex);
    
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
    this.toolsForm.reset({ 
      name: '',
      code: '',
      description: '',
      status: true 
    }); 
    this.photo = null;
    this.selectedImageFile = null;
    this.selectedTool = null;
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

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  createTool(): void {
    if (this.toolsForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos','Advertencia');
      this.markFormGroupTouched(this.toolsForm);
      return;
    }

    const toolData = {
      id_tool: generateUUID(),
      name_tool: this.toolsForm.value.name,
      code: this.toolsForm.value.code,
      description: this.toolsForm.value.description,
      image: 'Sin foto',
      status: this.toolsForm.value.status
    };
    console.log('Objeto enviado al API:', toolData);

    this.toolsAdapterService.post(toolData).subscribe({
      next: () => {
        this.toastr.success('Herramienta creada correctamente', 'Éxito');
        this.setCreateMode();
        this.hasConsulted = true;
        this.loadTools();
        this.closeAddModal();
      },
      error: err => {
        console.error('Error al guardar herramienta', err);
         this.errorService.handleError(err, 'Error al crear la herramienta');
      }
    });
  }

  viewTool(tool: ToolsCatalog): void {
    this.selectedTool = tool;
    setTimeout(() => {
      const modal = document.getElementById('visualizarHerramienta');
      if (modal) {
        const closeButton = modal.querySelector('.btn-close') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }
    }, 300);
  }

  openEditModal(tool: ToolsCatalog): void {
    this.isEditMode = true;
    this.selectedTool = tool;
    this.photo = tool.image;
    this.selectedImageFile = null;
    this.toolsForm.patchValue({
      name: tool.name_tool,
      code: tool.code,
      description: tool.description,
      status: tool.status
    });
  }

  handleEditClick(tool: ToolsCatalog): void {
    this.openEditModal(tool);
    const modal = document.getElementById('editarHerramientaModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
      
      setTimeout(() => {
        const firstInput = modal.querySelector('input[formControlName="name"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  updateTool(): void {
    if (!this.selectedTool?.id_tool) {
      this.toastr.error('No hay herramienta seleccionada para editar', 'Error');
      return;
    }

    const nameControl = this.toolsForm.get('name');
    const codeControl = this.toolsForm.get('code');
    const descriptionControl = this.toolsForm.get('description');

    if (!nameControl?.value || !codeControl?.value || !descriptionControl?.value) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.toolsForm);
      return;
    }

    const toolId = this.selectedTool.id_tool;
    
    const toolData: any = {
      name_tool: this.toolsForm.value.name,
      code: this.toolsForm.value.code,
      description: this.toolsForm.value.description,
      status: this.toolsForm.value.status,
      image: this.selectedImageFile ? undefined : (this.photo ? this.photo : 'Sin foto')
    };

    console.log('Objeto enviado al API (JSON):', toolData);

    if (this.selectedImageFile) {
      const formData = new FormData();
      formData.append('name_tool', toolData.name_tool);
      formData.append('code', toolData.code);
      formData.append('description', toolData.description);
      formData.append('status', String(toolData.status));
      formData.append('image', this.selectedImageFile);

      this.toolsAdapterService.put(toolId, formData).subscribe({
        next: () => {
          this.toastr.success('Herramienta actualizada correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadTools();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: err => {
          console.error('Error al actualizar herramienta:', err);
          this.errorService.handleError(err, 'Error al actualizar la herramienta');
        }
      });
    } else {
      if (!toolData.image) toolData.image = 'Sin foto';
      this.toolsAdapterService.put(toolId, toolData).subscribe({
        next: () => {
          this.toastr.success('Herramienta actualizada correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadTools();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: err => {
          console.error('Error al actualizar herramienta:', err);
          this.errorService.handleError(err, 'Error al actualizar la herramienta');
        }
      });
    }
  }

  deleteTool(tool: ToolsCatalog): void {
    if (!tool.id_tool) {
      this.toastr.error('No se puede eliminar la herramienta: ID no válido', 'Error');
      return;
    }

    if (confirm(`¿Está seguro que desea eliminar la herramienta "${tool.name_tool}"?`)) {
      this.toolsAdapterService.delete(tool.id_tool).subscribe({
        next: () => {
          this.toastr.success('Herramienta eliminada correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadTools(); 
        },
        error: err => {
          console.error('Error al eliminar herramienta:', err);
          this.errorService.handleError(err, 'Error al eliminar la herramienta');
        }
      });
    }
  }

  applyFilters(): void {
    if (!this.hasConsulted) {
      return;
    }
    this.filteredTools = this.allTools.filter(tool => {
      const searchMatch = !this.searchTerm || 
        tool.name_tool.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tool.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = tool.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = tool.status === false;
      } else {
        statusMatch = tool.status === true;
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
    this.filteredTools = this.allTools.filter(tool => tool.status === true);
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
    this.closeModal('agregarHerramientaModal');
  }

  closeEditModal(): void {
    this.closeModal('editarHerramientaModal');
  }

  closeViewModal(): void {
    this.closeModal('visualizarHerramienta');
  }

  async exportTools(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const toolsToExport = this.filteredTools;
      await this.reportsToolsService.generateToolsReport(toolsToExport, 'CATÁLOGO DE HERRAMIENTAS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

  syncFromFirebase(): void {
    this.isLoading = true;
    this.toolsAdapterService.syncToFirebase().subscribe({
      next: (res) => {
        this.toastr.success('Sincronización completada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadTools();
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

  syncTools(): void {
    this.syncFromFirebase();
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
