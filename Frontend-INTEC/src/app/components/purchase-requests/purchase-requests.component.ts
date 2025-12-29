import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestHeadersAdapterService } from '../../adapters/request_headers.adapter';
import { RequestDetailsAdapterService } from '../../adapters/request_details.adapter';
import { RequestAdditionalAdapterService } from '../../adapters/request_additional.adapter';
import { MaterialsCatalogAdapterService } from '../../adapters/materials_catalog.adapter';
import { ToolsCatalogAdapterService } from '../../adapters/tools_catalog.adapter';
import { RequestHeaders } from '../../models/request_headers';
import { RequestDetails } from '../../models/request_details';
import { RequestAdditional } from '../../models/request_additional';
import { MaterialsCatalog } from '../../models/materials_catalog';
import { ToolsCatalog } from '../../models/tools_catalog';

@Component({
  selector: 'app-purchase-requests',
  templateUrl: './purchase-requests.component.html',
  styleUrl: './purchase-requests.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class PurchaseRequestsComponent implements OnInit {
  requestForm: FormGroup;
  detailsForm: FormGroup;
  isEditMode: boolean = false;
  selectedRequest: RequestHeaders | null = null;
  requests: RequestHeaders[] = [];
  allRequests: RequestHeaders[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredRequests: RequestHeaders[] = [];
  requestDetails: RequestDetails[] = [];
  selectedDetail: RequestDetails | null = null;
  isDetailEditMode: boolean = false;
  additionalDetails: Set<string> = new Set();
  originalDetails: Map<string, RequestDetails> = new Map();
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  ivaEnabled: boolean = true;
  materials: MaterialsCatalog[] = [];
  tools: ToolsCatalog[] = [];
  combinedCatalog: (MaterialsCatalog | ToolsCatalog)[] = [];
  selectedArticleType: string = '';
  showEditArticleModal: boolean = false;
  editingRequestDetail: RequestDetails | null = null;
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private requestHeadersAdapterService: RequestHeadersAdapterService,
    private requestDetailsAdapterService: RequestDetailsAdapterService,
    private requestAdditionalAdapterService: RequestAdditionalAdapterService,
    private materialsCatalogAdapterService: MaterialsCatalogAdapterService,
    private toolsCatalogAdapterService: ToolsCatalogAdapterService
  ) {
    this.requestForm = this.fb.group({
      id_header: ['', Validators.required],
      auth1: ['', Validators.required],
      auth2: ['', Validators.required],
      auth3: ['', Validators.required],
      status_header: ['', Validators.required],
      locationType: ['', Validators.required],
      date: ['', Validators.required],
      hour: ['', Validators.required],
      revision_date1: [''],
      revision_date2: [''],
      revision_date3: [''],
      folio_request: ['', Validators.required],
      locality: ['', Validators.required],
      notes: [''],
      project: ['', Validators.required],
      official: ['', Validators.required],
      revision1: [''],
      revision2: [''],
      revision3: [''],
      requester: ['', Validators.required],
      work: ['', Validators.required],
      status: [true]
    });

    this.detailsForm = this.fb.group({
      id_detail: ['', Validators.required],
      name: ['', Validators.required],
      amount: [0, Validators.required],
      code: [''],
      c1: [''],
      c2: [''],
      unit_cost: [0, Validators.required],
      description: [''],
      observation: [''],
      folio_request: ['', Validators.required],
      category1: [''],
      category: [''],
      subcategory: [''],
      unit: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadMaterials();
    this.loadTools();
    this.setCreateMode();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.requestHeadersAdapterService.getList().subscribe({
      next: (data) => {
        this.allRequests = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar solicitudes', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  consultRequests(): void {
    this.refreshRequests();
  }

  private refreshRequests(): void {
    this.hasConsulted = true;
    this.loadRequests();
  }

  loadMaterials(): void {
    this.materialsCatalogAdapterService.getList().subscribe({
      next: (data) => {
        this.materials = data.filter(material => material.status === true);
        this.updateCombinedCatalog();
      
      },
      error: (err) => {
        console.error('Error al cargar materiales', err);
      }
    });
  }

  loadTools(): void {
    this.toolsCatalogAdapterService.getList().subscribe({
      next: (data) => {
        this.tools = data.filter(tool => tool.status === true);
        this.updateCombinedCatalog();
      },
      error: (err) => {
        console.error('Error al cargar herramientas', err);
      }
    });
  }

  updateCombinedCatalog(): void {
    this.combinedCatalog = [
      ...this.materials.map(material => ({ ...material, type: 'M' as const })),
      ...this.tools.map(tool => ({ ...tool, type: 'H' as const }))
    ];
   
  }

  onArticleChange(): void {
    const selectedValue = this.detailsForm.get('name')?.value;
    
    if (selectedValue) {
      const [type, id] = selectedValue.split('|');
      this.selectedArticleType = type;
      
      if (type === 'M') {
        const material = this.materials.find(m => m.id_material === id);
        if (material) {
          this.detailsForm.patchValue({
            code: material.code || '',
            c1: material.c1 || '',
            c2: material.c2 || '',
            unit: material.unit || '',
            category1: 'M',
            category: material.category || '',
            subcategory: material.subcategory || '',
            description: ''
          });
   
        } else {
        }
      } else if (type === 'H') {
        const tool = this.tools.find(t => t.id_tool === id);
        if (tool) {
          this.detailsForm.patchValue({
            code: tool.code || '',
            c1: '',
            c2: '',
            unit: 'PIEZA',
            category1: 'H',
            category: 'HERRAMIENTAS',
            subcategory: 'HERRAMIENTAS',
            description: tool.description || ''
                      });

          }
      }
    } else {
      this.selectedArticleType = '';
      this.detailsForm.patchValue({
        code: '',
        c1: '',
        c2: '',
        unit: '',
        category1: '',
        category: '',
        subcategory: '',
        description: ''
      });
    }
  }

  getDisplayName(item: any): string {
    if ('name_material' in item) {
      return `[MATERIAL] ${item.name_material}`;
    } else if ('name_tool' in item) {
      return `[HERRAMIENTA] ${item.name_tool}`;
    }
    return '';
  }

  getItemValue(item: any): string {
    if ('name_material' in item) {
      return `M|${item.id_material}`;
    } else if ('name_tool' in item) {
      return `H|${item.id_tool}`;
    }
    return '';
  }



  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredRequests.length);
    this.requests = this.filteredRequests.slice(startIndex, endIndex);
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
    this.loadCurrentFolio();
    this.requestForm.reset({
      id_header: '',
      auth1: '0',
      auth2: '0',
      auth3: '0',
      status_header: 'Pendiente',
      locationType: 'local',
      date: '',
      hour: '',
      revision_date1: '',
      revision_date2: '',
      revision_date3: '',
      folio_request: '',
      locality: 'Guadalajara',
      notes: '',
      project: '',
      official: '',
      revision1: '',
      revision2: '',
      revision3: '',
      requester: '',
      work: '',
      status: true
    });
    this.detailsForm.reset({
      id_detail: '',
      name: '',
      amount: 0,
      code: '',
      c1: '',
      c2: '',
      unit_cost: 0,
      description: '',
      observation: '',
      folio_request: '',
      category1: '',
      category: '',
      subcategory: '',
      unit: '',
      status: true
    });
    this.selectedRequest = null;
    this.requestDetails = [];
    this.selectedDetail = null;
    this.isDetailEditMode = false;
    this.additionalDetails.clear();
    this.originalDetails.clear();
    this.calculateTotals();
  }

  createRequest(): void {
    if (this.requestForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos del encabezado', 'Advertencia');
      this.markFormGroupTouched(this.requestForm);
      return;
    }

    this.toastr.info('Encabezado validado. Agregue los detalles y luego finalice la solicitud.', 'Información');
  }

  addDetail(): void {

    if (this.detailsForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos del detalle', 'Advertencia');
      this.markFormGroupTouched(this.detailsForm);
      return;
    }

    const selectedValue = this.detailsForm.value.name;
    let realName = '';
    
    if (selectedValue && selectedValue.includes('|')) {
      const [type, id] = selectedValue.split('|');
      
      if (type === 'M') {
        const material = this.materials.find(m => m.id_material === id);
        realName = material?.name_material || '';
        if (!realName) {
        }
      } else if (type === 'H') {
        const tool = this.tools.find(t => t.id_tool === id);
        realName = tool?.name_tool || '';
        if (!realName) {
        }
      }
    } else {
    }
    

    if (!realName || realName.trim() === '') {
      console.error('❌ Error: No se pudo obtener el nombre del artículo seleccionado');
      this.toastr.error('Error al obtener el nombre del artículo. Por favor seleccione nuevamente.', 'Error');
      return;
    }

    const idDetail = `D${this.requestForm.value.folio_request}`;
    
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const detailData = {
      id_detail: idDetail,
      temp_id: tempId,
      ...this.detailsForm.value,
      name: realName,
      folio_request: this.requestForm.value.folio_request
    };

    if (this.isEditMode) {
      this.additionalDetails.add(tempId);
    }

    this.requestDetails.push(detailData);
    this.calculateTotals();
    
    this.selectedArticleType = '';
    
    const detailId = `D${this.requestForm.value.folio_request}`;
    
    this.detailsForm.reset({
      id_detail: detailId,
      name: '',
      amount: 0,
      code: '',
      c1: '',
      c2: '',
      unit_cost: 0,
      description: '',
      observation: '',
      folio_request: this.requestForm.value.folio_request,
      category1: '',
      category: '',
      subcategory: '',
      unit: '',
      status: true
    });

    this.toastr.success('Detalle agregado correctamente', 'Éxito');
  }

  editDetail(detail: RequestDetails): void {
    event?.preventDefault();
    event?.stopPropagation();
    
    this.editingRequestDetail = detail;
    this.showEditArticleModal = true;
  }

  confirmEditDetail(): void {
    if (!this.editingRequestDetail) return;
    
    const detail = this.editingRequestDetail;
    this.selectedDetail = detail;
    this.isDetailEditMode = true;
    this.selectedArticleType = detail.category1 || '';
    
    let dropdownValue = '';
    
    if (detail.category1 === 'M') {
      const material = this.materials.find(m => m.name_material === detail.name);
      if (material) {
        dropdownValue = `M|${material.id_material}`;
      }
    } else if (detail.category1 === 'H') {
      const tool = this.tools.find(t => t.name_tool === detail.name);
      if (tool) {
        dropdownValue = `H|${tool.id_tool}`;
      }
    }
    
    this.detailsForm.patchValue({
      ...detail,
      name: dropdownValue || detail.name
    });
    
    this.closeEditArticleModal();
  }

  cancelEditDetail(): void {
    this.editingRequestDetail = null;
    this.closeEditArticleModal();
  }

  closeEditArticleModal(): void {
    this.showEditArticleModal = false;
    this.editingRequestDetail = null;
  }

  updateDetail(): void {
    if (!this.selectedDetail) return;

    if (this.detailsForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos del detalle', 'Advertencia');
      this.markFormGroupTouched(this.detailsForm);
      return;
    }

    const selectedValue = this.detailsForm.value.name;
    let realName = '';
    
    if (selectedValue && selectedValue.includes('|')) {
      const [type, id] = selectedValue.split('|');
      if (type === 'M') {
        const material = this.materials.find(m => m.id_material === id);
        realName = material?.name_material || '';
      } else if (type === 'H') {
        const tool = this.tools.find(t => t.id_tool === id);
        realName = tool?.name_tool || '';
      }
    } else {
      realName = selectedValue;
    }

    const originalDetail = this.originalDetails.get(this.selectedDetail.temp_id || '') || this.selectedDetail;
    
    const updatedDetail = { 
      ...this.detailsForm.value,
      name: realName,
      id: this.selectedDetail.id,
      temp_id: this.selectedDetail.temp_id
    };

    const hasChanges = 
      updatedDetail.amount !== originalDetail.amount ||
      updatedDetail.unit_cost !== originalDetail.unit_cost ||
      updatedDetail.name !== originalDetail.name ||
      updatedDetail.code !== originalDetail.code ||
      updatedDetail.description !== originalDetail.description;

    if (this.isEditMode && hasChanges && this.selectedDetail.temp_id) {
      this.additionalDetails.add(this.selectedDetail.temp_id);
    }

    const index = this.requestDetails.findIndex(d => d.temp_id === this.selectedDetail?.temp_id);
    
    if (index !== -1) {
      this.requestDetails[index] = updatedDetail;
      this.calculateTotals();
      
      this.toastr.success('Material actualizado correctamente', 'Éxito');
      
    } else {
      this.toastr.error('Error al encontrar el detalle a actualizar', 'Error');
    }

    this.cancelDetailEditForm();
  }


  removeDetail(detail: RequestDetails): void {
    event?.preventDefault();
    event?.stopPropagation();
    
    const index = this.requestDetails.findIndex(d => d.temp_id === detail.temp_id);
    if (index !== -1) {
      this.requestDetails.splice(index, 1);
      this.calculateTotals();
      this.toastr.success('Detalle eliminado correctamente', 'Éxito');
      
    } else {
      this.toastr.error('Error al encontrar el detalle a eliminar', 'Error');
    }
  }

  cancelDetailEditForm(): void {
    this.selectedDetail = null;
    this.isDetailEditMode = false;
    this.selectedArticleType = '';
    
    const detailId = `D${this.requestForm.value.folio_request}`;
    
    this.detailsForm.reset({
      id_detail: detailId,
      name: '',
      amount: 0,
      code: '',
      c1: '',
      c2: '',
      unit_cost: 0,
      description: '',
      observation: '',
      folio_request: this.requestForm.value.folio_request,
      category1: '',
      category: '',
      subcategory: '',
      unit: '',
      status: true
    });
  }

  calculateTotals(): void {
    this.subtotal = this.requestDetails.reduce((sum, detail) => {
      return sum + (detail.amount * detail.unit_cost);
    }, 0);
    
    this.iva = this.ivaEnabled ? this.subtotal * 0.16 : 0;
    this.total = this.subtotal + this.iva;
  }

  toggleIva(): void {
    this.ivaEnabled = !this.ivaEnabled;
    this.calculateTotals();
  }

  finishRequest(): void {
    if (this.requestDetails.length === 0) {
      this.toastr.error('Debe agregar al menos un detalle a la solicitud', 'Advertencia');
      return;
    }

    if (this.requestForm.invalid) {
      this.toastr.error('Completar todos los campos requeridos del encabezado', 'Advertencia');
      this.markFormGroupTouched(this.requestForm);
      return;
    }

    const requestData = {
      id_header: this.requestForm.value.id_header,
      ...this.requestForm.value
    };


    this.requestHeadersAdapterService.post(requestData).subscribe({
      next: () => {
        
        const allDetailsToSave = this.requestDetails.map((detail, index) => {
          const { temp_id, ...detailWithoutTempId } = detail as any;
          const detailToSave = {
            ...detailWithoutTempId,
            folio_request: requestData.folio_request,
            status: detail.status !== undefined ? detail.status : true,
            observation: detail.observation || '',
            description: detail.description || ''
          };
          
          
          return detailToSave;
        });
        
        this.requestDetailsAdapterService.post(allDetailsToSave).toPromise()
          .then(() => {
            this.toastr.success('Solicitud completada correctamente', 'Éxito');
            this.setCreateMode();
            this.closeAddModal();
            this.refreshRequests();
          })
          .catch(err => {
            console.error('❌ Error al guardar detalles:', err);
            this.toastr.error('Error al completar la solicitud', 'Error');
          });
      },
      error: err => {
        console.error('❌ Error al guardar encabezado:', err);
        this.toastr.error('Error al guardar el encabezado de la solicitud', 'Error');
      }
    });
  }

  openEditModal(request: RequestHeaders): void {
    this.isEditMode = true;
    this.selectedRequest = request;
    
    this.requestForm.patchValue({
      id_header: request.id_header,
      auth1: request.auth1,
      auth2: request.auth2,
      auth3: request.auth3,
      status_header: request.status_header || 'Pendiente',
      locationType: request.locationType,
      date: request.date,
      hour: request.hour,
      revision_date1: request.revision_date1,
      revision_date2: request.revision_date2,
      revision_date3: request.revision_date3,
      folio_request: request.folio_request,
      locality: request.locality,
      notes: request.notes,
      project: request.project,
      official: request.official,
      revision1: request.revision1,
      revision2: request.revision2,
      revision3: request.revision3,
      requester: request.requester,
      work: request.work,
      status: request.status
    });

    this.loadRequestDetails(request.folio_request);
  }

  loadRequestDetails(folioRequest: string): void {
    this.requestDetailsAdapterService.getList().subscribe({
      next: (details) => {
        this.requestDetails = details.filter(detail => detail.folio_request === folioRequest);
        
        this.requestDetails = this.requestDetails.map(detail => ({
          ...detail,
          temp_id: detail.temp_id || `loaded_${detail.id || detail.id_detail}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        
        this.originalDetails.clear();
        this.requestDetails.forEach(detail => {
          if (detail.temp_id) {
            this.originalDetails.set(detail.temp_id, { ...detail });
          }
        });

        this.additionalDetails.clear();
        
        const detailsWithoutId = this.requestDetails.filter(detail => !detail.id);
        if (detailsWithoutId.length > 0) {
        }
        


        
        this.calculateTotals();
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        this.requestDetails = [];
        this.calculateTotals();
      }
    });
  }

  handleEditClick(request: RequestHeaders): void {
    this.openEditModal(request);
    this.showEditModal();
  }

  private showEditModal(): void {
    setTimeout(() => {
      const modal = document.getElementById('editarSolicitudModal');
      if (modal) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
        
        setTimeout(() => {
          const firstInput = modal.querySelector('input[formControlName="project"]') as HTMLElement;
          if (firstInput) {
            firstInput.focus();
          }
        }, 200);
      }
    }, 150);
  }

  updateRequest(): void {
    if (!this.selectedRequest?.id_header) {
      this.toastr.error('No hay solicitud seleccionada para editar', 'Error');
      return;
    }

    if (this.requestForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.requestForm);
      return;
    }

    const requestId = this.selectedRequest.id_header;
    const requestData = this.requestForm.value;


    const requestDataArray: RequestHeaders[] = [requestData];
    
    
    this.requestHeadersAdapterService.put(requestId, requestDataArray).subscribe({
      next: () => {
        if (this.requestDetails.length > 0) {
          this.updateRequestDetails();
        } else {
          this.toastr.success('Solicitud actualizada correctamente', 'Éxito');
          this.refreshRequests();
          this.closeEditModal();
          this.setCreateMode();
        }
      },
      error: err => {
        console.error('Error al actualizar solicitud:', err);
        this.toastr.error('Error al actualizar la solicitud', 'Error');
      }
    });
  }

  saveRequestChanges(): void {
    if (!this.selectedRequest?.id_header) {
      this.toastr.error('No hay solicitud seleccionada para editar', 'Error');
      return;
    }

    if (this.requestForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.requestForm);
      return;
    }

    const requestId = this.selectedRequest.id_header;
    const requestData = this.requestForm.value;


    if (!requestId || requestId.trim() === '') {
      this.toastr.error('ID de solicitud no válido', 'Error');
      return;
    }

    const requestDataArray: RequestHeaders[] = [requestData];
    console.log(requestDataArray);

    
    this.requestHeadersAdapterService.put(requestId, requestDataArray).subscribe({
      next: () => {
        if (this.requestDetails.length > 0) {
          this.updateRequestDetails();
        } else {
          this.toastr.success('Solicitud actualizada correctamente', 'Éxito');
          this.refreshRequests();
          this.closeEditModal();
          this.setCreateMode();
        }
      },
      error: err => {
        
        if (err.status === 500) {
          this.toastr.error('Error interno del servidor. Verifique los datos enviados.', 'Error del API');
        } else if (err.status === 404) {
          this.toastr.error('Solicitud no encontrada en el servidor', 'Error del API');
        } else if (err.status === 400) {
          this.toastr.error('Datos inválidos enviados al servidor', 'Error del API');
        } else {
          this.toastr.error(`Error del servidor (${err.status}): ${err.statusText}`, 'Error del API');
        }
      }
    });
  }

  private convertToRequestAdditional(detail: RequestDetails, originalDetail?: RequestDetails): RequestAdditional {
    let idDetail = detail.id_detail;
    if (idDetail && idDetail.startsWith('D')) {
      const folio = idDetail.substring(1);
      idDetail = `A${folio}`;
    }
    
    let amountToSave = detail.amount;
    if (originalDetail && detail.amount > originalDetail.amount) {
      amountToSave = detail.amount - originalDetail.amount;
    }
    
    return {
      id_detail: idDetail,
      temp_id: detail.temp_id,
      name: detail.name,
      amount: amountToSave,
      code: detail.code || '',
      c1: detail.c1 || '',
      c2: detail.c2 || '',
      unit_cost: detail.unit_cost,
      description: detail.description || '',
      observation: detail.observation || '',
      folio_request: detail.folio_request,
      category1: detail.category1 || '',
      category: detail.category || '',
      subcategory: detail.subcategory || '',
      unit: detail.unit,
      status: detail.status !== undefined ? detail.status : true
    };
  }

  updateRequestDetails(): void {
    if (this.requestDetails.length === 0) {
      this.toastr.success('Solicitud actualizada correctamente', 'Éxito');
      this.refreshRequests();
      this.closeEditModal();
      this.setCreateMode();
      return;
    }


    const additionalDetailsList: RequestAdditional[] = [];
    const originalDetailsToUpdate: RequestDetails[] = [];

    this.requestDetails.forEach(detail => {
      if (detail.temp_id && this.additionalDetails.has(detail.temp_id)) {
        const originalDetail = this.originalDetails.get(detail.temp_id);
        const additionalDetail = this.convertToRequestAdditional(detail, originalDetail);
        additionalDetailsList.push(additionalDetail);
      } else if (detail.id && detail.id > 0) {
        const { temp_id, ...detailWithoutTempId } = detail as any;
        originalDetailsToUpdate.push({
          id: detail.id,
          ...detailWithoutTempId,
          folio_request: this.selectedRequest?.folio_request || detail.folio_request
        } as RequestDetails);
      }
    });

    if (additionalDetailsList.length > 0) {
      this.requestAdditionalAdapterService.post(additionalDetailsList).subscribe({
        next: () => {
          if (originalDetailsToUpdate.length > 0) {
            this.requestDetailsAdapterService.put('update', originalDetailsToUpdate).subscribe({
              next: () => {
                this.toastr.success('Solicitud y detalles actualizados correctamente', 'Éxito');
                this.refreshRequests();
                this.closeEditModal();
                this.setCreateMode();
              },
              error: (err) => {
                console.error('Error al actualizar detalles originales:', err);
                this.toastr.error('Error al actualizar algunos detalles', 'Error');
              }
            });
          } else {
            this.toastr.success('Solicitud y detalles adicionales guardados correctamente', 'Éxito');
            this.refreshRequests();
            this.closeEditModal();
            this.setCreateMode();
          }
        },
        error: (err) => {
          console.error('Error al guardar detalles adicionales:', err);
          this.toastr.error('Error al guardar los detalles adicionales', 'Error');
        }
      });
    } else if (originalDetailsToUpdate.length > 0) {
      this.requestDetailsAdapterService.put('update', originalDetailsToUpdate).subscribe({
        next: () => {
          this.toastr.success('Solicitud y detalles actualizados correctamente', 'Éxito');
          this.refreshRequests();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: (err) => {
          console.error('Error al actualizar detalles:', err);
          this.toastr.error('Error al actualizar los detalles', 'Error');
        }
      });
    } else {
      this.toastr.success('Solicitud actualizada correctamente', 'Éxito');
      this.refreshRequests();
      this.closeEditModal();
      this.setCreateMode();
    }
  }

  deleteRequest(request: RequestHeaders): void {
    if (!request.id_header) {
      this.toastr.error('No se puede eliminar la solicitud: ID no válido', 'Error');
      return;
    }
    if (confirm(`¿Está seguro que desea eliminar la solicitud "${request.folio_request}" y todos sus detalles?`)) {
      
      this.deleteRequestDetails(request.folio_request).then(() => {
        this.requestHeadersAdapterService.delete(request.id_header).subscribe({
          next: () => {
            this.toastr.success('Solicitud y detalles eliminados correctamente', 'Éxito');
            this.refreshRequests();
          },
          error: err => {
            console.error('Error al eliminar encabezado:', err);
            this.toastr.error('Error al eliminar la solicitud', 'Error');
          }
        });
      }).catch(err => {
        console.error('Error al eliminar detalles:', err);
        this.toastr.error('Error al eliminar los detalles de la solicitud', 'Error');
      });
    }
  }

  deleteRequestDetails(folioRequest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.requestDetailsAdapterService.getList().subscribe({
        next: (allDetails) => {
          const detailsToDelete = allDetails.filter(detail => detail.folio_request === folioRequest);
          
          if (detailsToDelete.length === 0) {
            resolve();
            return;
          }

          
          let completedDeletions = 0;
          let hasError = false;

          detailsToDelete.forEach((detail, index) => {
            this.requestDetailsAdapterService.delete(detail.id_detail).subscribe({
              next: () => {
                completedDeletions++;
                
                if (completedDeletions === detailsToDelete.length && !hasError) {
                  resolve();
                }
              },
              error: (err) => {
                console.error(`❌ Error al eliminar detalle ${index + 1}:`, err);
                hasError = true;
                reject(err);
              }
            });
          });
        },
        error: (err) => {
          console.error('Error al obtener detalles para eliminar:', err);
          reject(err);
        }
      });
    });
  }

  applyFilters(): void {
    if (!this.hasConsulted) {
      return;
    }
    this.filteredRequests = this.allRequests.filter(req => {
      const searchMatch = !this.searchTerm ||
        req.folio_request.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        req.project.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        req.requester.toLowerCase().includes(this.searchTerm.toLowerCase());
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = req.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = req.status === false;
      } else {
        statusMatch = req.status === true;
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
    this.filteredRequests = this.allRequests.filter(req => req.status === true);
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
    this.closeModal('agregarSolicitudModal');
  }

  closeEditModal(): void {
    this.closeModal('editarSolicitudModal');
  }

  syncRequests(): void {
    this.isLoading = true;
    this.requestHeadersAdapterService.syncToFirebase().subscribe({
      next: () => {
        this.requestDetailsAdapterService.syncToFirebase().subscribe({
          next: () => {
            this.toastr.success('Sincronización completada correctamente', 'Éxito');
            this.refreshRequests();
          },
          error: (err) => {
            console.error('❌ Error al sincronizar detalles:', err);
            this.toastr.error('Error al sincronizar detalles', 'Error');
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al sincronizar encabezados:', err);
        this.toastr.error('Error al sincronizar encabezados', 'Error');
        this.isLoading = false;
      }
    });
  }

  exportRequests(): void {
    this.toastr.info('Función de exportar en desarrollo', 'Información');
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  loadCurrentFolio(): void {
    this.requestDetailsAdapterService.getCurrentFolio().subscribe({
      next: (response) => {
        const folio = response.folio;
        const idHeader = `E${folio}`;
        const idDetail = `D${folio}`;
        
        this.requestForm.patchValue({
          folio_request: folio.toString(),
          id_header: idHeader,
          date: this.getCurrentDate(),
          hour: this.getCurrentTime()
        });
        
        this.detailsForm.patchValue({
          folio_request: folio.toString(),
          id_detail: idDetail
        });
      },
      error: (err) => {
        console.error('Error al obtener el folio actual:', err);
        this.toastr.error('Error al obtener el folio actual', 'Error');
      }
    });
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }


} 