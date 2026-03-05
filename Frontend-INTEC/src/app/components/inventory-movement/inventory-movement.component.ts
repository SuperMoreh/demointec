import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryMovementAdapterService } from '../../adapters/inventory-movement.adapter';
import { InventoryAdapterService } from '../../adapters/inventory.adapter';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { InventoryMovement } from '../../models/inventory-movement';
import { Inventory } from '../../models/inventory';
import { Employee } from '../../models/employees';
import { ReportInventoryMovementService } from '../../services/report-inventory-movement.service';

@Component({
  selector: 'app-inventory-movement',
  templateUrl: './inventory-movement.component.html',
  styleUrl: './inventory-movement.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class InventoryMovementComponent implements OnInit {
  movementForm: FormGroup;
  selectedItem: InventoryMovement | null = null;
  items: InventoryMovement[] = [];
  allItems: InventoryMovement[] = [];
  filteredItems: InventoryMovement[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedType: string = '';
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  inventoryList: Inventory[] = [];
  employeeList: Employee[] = [];

  movementTypeOptions = ['Salida', 'Entrada', 'Ajuste', 'Transferencia', 'Baja'];

  private movementAdapter = inject(InventoryMovementAdapterService);
  private inventoryAdapter = inject(InventoryAdapterService);
  private employeesAdapter = inject(EmployeesAdapterService);
  private reportService = inject(ReportInventoryMovementService);

  constructor(private fb: FormBuilder) {
    this.movementForm = this.fb.group({
      id_inventory: ['', Validators.required],
      movement_type: ['Salida', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required],
      id_employee: [''],
      responsible: [''],
      movement_date: ['', Validators.required],
      observations: ['']
    });
  }

  ngOnInit(): void {
    this.inventoryAdapter.getList().subscribe({
      next: (data: Inventory[]) => { this.inventoryList = data; },
      error: () => {}
    });
    this.employeesAdapter.getList().subscribe({
      next: (data: Employee[]) => { this.employeeList = data; },
      error: () => {}
    });
  }

  getInventoryName(id: string): string {
    return this.inventoryList.find(i => i.id_inventory === id)?.name_inventory ?? id;
  }

  getEmployeeName(id: string): string {
    if (!id) return '—';
    return this.employeeList.find(e => e.id_employee === id)?.name_employee ?? id;
  }

  openRegistrarModal(): void {
    this.movementForm.reset({ movement_type: 'Salida', quantity: 1 });
    const el = document.getElementById('registrarMovimientoModal');
    if (el) new (window as any).bootstrap.Modal(el).show();
  }

  consultItems(): void {
    this.isLoading = true;
    this.hasConsulted = true;
    this.movementAdapter.getList().subscribe({
      next: (data: InventoryMovement[]) => {
        this.allItems = data;
        this.filteredItems = [...data];
        this.updatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  saveItem(): void {
    if (this.movementForm.invalid) {
      this.movementForm.markAllAsTouched();
      return;
    }
    const data: InventoryMovement = this.movementForm.value;
    this.movementAdapter.post(data).subscribe({
      next: () => {
        this.closeModal('registrarMovimientoModal');
        this.consultItems();
      },
      error: () => {}
    });
  }

  viewItem(item: InventoryMovement): void {
    this.selectedItem = item;
    const el = document.getElementById('visualizarMovimientoModal');
    if (el) new (window as any).bootstrap.Modal(el).show();
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) bootstrapModal.hide();
    }
  }

  applyFilters(): void {
    let filtered = [...this.allItems];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        this.getInventoryName(i.id_inventory).toLowerCase().includes(term) ||
        i.reason?.toLowerCase().includes(term) ||
        i.responsible?.toLowerCase().includes(term)
      );
    }
    if (this.selectedType) {
      filtered = filtered.filter(i => i.movement_type === this.selectedType);
    }
    this.filteredItems = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.filteredItems = [...this.allItems];
    this.currentPage = 1;
    this.updatePagination();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedType);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
    this.pages = Array.from({ length: Math.min(this.maxPagesToShow, this.totalPages) }, (_, i) => i + 1);
    this.items = this.filteredItems.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.items = this.filteredItems.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  exportToExcel(): void {
    this.reportService.exportToExcel(this.filteredItems, this.getInventoryName.bind(this), this.getEmployeeName.bind(this));
  }
}
