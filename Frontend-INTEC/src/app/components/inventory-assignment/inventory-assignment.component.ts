import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryAssignmentAdapterService } from '../../adapters/inventory-assignment.adapter';
import { InventoryAdapterService } from '../../adapters/inventory.adapter';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { InventoryAssignment } from '../../models/inventory-assignment';
import { Inventory } from '../../models/inventory';
import { Employee } from '../../models/employees';
import { ReportInventoryAssignmentService } from '../../services/report-inventory-assignment.service';

@Component({
  selector: 'app-inventory-assignment',
  templateUrl: './inventory-assignment.component.html',
  styleUrl: './inventory-assignment.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class InventoryAssignmentComponent implements OnInit {
  assignmentForm: FormGroup;
  isEditMode: boolean = false;
  selectedItem: InventoryAssignment | null = null;
  items: InventoryAssignment[] = [];
  allItems: InventoryAssignment[] = [];
  filteredItems: InventoryAssignment[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedState: string = '';
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  inventoryList: Inventory[] = [];
  employeeList: Employee[] = [];

  stateOptions = ['Asignado', 'Devuelto', 'Extraviado', 'Dañado'];

  private assignmentAdapter = inject(InventoryAssignmentAdapterService);
  private inventoryAdapter = inject(InventoryAdapterService);
  private employeesAdapter = inject(EmployeesAdapterService);
  private reportService = inject(ReportInventoryAssignmentService);

  constructor(private fb: FormBuilder) {
    this.assignmentForm = this.fb.group({
      id_inventory: ['', Validators.required],
      id_employee: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      assignment_date: ['', Validators.required],
      return_date: [''],
      state: ['Asignado', Validators.required],
      responsible: [''],
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
    return this.employeeList.find(e => e.id_employee === id)?.name_employee ?? id;
  }

  setCreateMode(): void {
    this.isEditMode = false;
    this.selectedItem = null;
    this.assignmentForm.reset({ quantity: 1, state: 'Asignado' });
    const el = document.getElementById('agregarAsignacionModal');
    if (el) new (window as any).bootstrap.Modal(el).show();
  }

  consultItems(): void {
    this.isLoading = true;
    this.hasConsulted = true;
    this.assignmentAdapter.getList().subscribe({
      next: (data: InventoryAssignment[]) => {
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
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }
    const data: InventoryAssignment = this.assignmentForm.value;
    this.assignmentAdapter.post(data).subscribe({
      next: () => {
        this.closeModal('agregarAsignacionModal');
        this.consultItems();
      },
      error: () => {}
    });
  }

  editItem(item: InventoryAssignment): void {
    this.isEditMode = true;
    this.selectedItem = item;
    this.assignmentForm.patchValue(item);
    const el = document.getElementById('editarAsignacionModal');
    if (el) new (window as any).bootstrap.Modal(el).show();
  }

  updateItem(): void {
    if (this.assignmentForm.invalid || !this.selectedItem?.id_assignment) {
      this.assignmentForm.markAllAsTouched();
      return;
    }
    const data: InventoryAssignment = this.assignmentForm.value;
    this.assignmentAdapter.put(this.selectedItem.id_assignment, data).subscribe({
      next: () => {
        this.closeModal('editarAsignacionModal');
        this.consultItems();
      },
      error: () => {}
    });
  }

  deleteItem(item: InventoryAssignment): void {
    if (!item.id_assignment) return;
    this.assignmentAdapter.delete(item.id_assignment).subscribe({
      next: () => this.consultItems(),
      error: () => {}
    });
  }

  viewItem(item: InventoryAssignment): void {
    this.selectedItem = item;
    const el = document.getElementById('visualizarAsignacionModal');
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
        this.getEmployeeName(i.id_employee).toLowerCase().includes(term) ||
        i.responsible?.toLowerCase().includes(term)
      );
    }
    if (this.selectedState) {
      filtered = filtered.filter(i => i.state === this.selectedState);
    }
    this.filteredItems = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedState = '';
    this.filteredItems = [...this.allItems];
    this.currentPage = 1;
    this.updatePagination();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedState);
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
