import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SalaryTabulatorAdapterService } from '../../adapters/salary-tabulator.adapter';
import { SalaryTabulator } from '../../models/salary-tabulator';

@Component({
  selector: 'app-salary-tabulador',
  templateUrl: './salary-tabulador.component.html',
  styleUrl: './salary-tabulador.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SalaryTabuladorComponent implements OnInit {
  private adapter = inject(SalaryTabulatorAdapterService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  records: SalaryTabulator[] = [];
  filteredRecords: SalaryTabulator[] = [];
  selectedRecord: SalaryTabulator | null = null;

  searchTerm: string = '';
  isLoading: boolean = false;
  hasConsulted: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pages: number[] = [];

  addForm: FormGroup = this.fb.group({
    position: ['', Validators.required],
    geographic_zone: ['', Validators.required],
    weekly_salary: [null, [Validators.required, Validators.min(0)]]
  });

  editForm: FormGroup = this.fb.group({
    position: ['', Validators.required],
    geographic_zone: ['', Validators.required],
    weekly_salary: [null, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.hasConsulted = true;
    this.adapter.getList().subscribe({
      next: (data) => {
        this.records = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Error al cargar el tabulador');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredRecords = term
      ? this.records.filter(r =>
          r.position?.toLowerCase().includes(term) ||
          r.geographic_zone?.toLowerCase().includes(term)
        )
      : [...this.records];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRecords.length / this.itemsPerPage) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedRecords(): SalaryTabulator[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openAdd(): void {
    this.addForm.reset();
    this.openModal('agregarTabuladorModal');
  }

  save(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      this.toastr.warning('Completa los campos requeridos');
      return;
    }
    this.adapter.create(this.addForm.value).subscribe({
      next: () => {
        this.toastr.success('Registro creado');
        this.closeModal('agregarTabuladorModal');
        this.load();
      },
      error: () => this.toastr.error('Error al crear el registro')
    });
  }

  openEdit(record: SalaryTabulator): void {
    this.selectedRecord = record;
    this.editForm.patchValue({
      position: record.position,
      geographic_zone: record.geographic_zone,
      weekly_salary: record.weekly_salary
    });
    this.openModal('editarTabuladorModal');
  }

  update(): void {
    if (!this.selectedRecord?.id_salary_tabulator) return;
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.toastr.warning('Completa los campos requeridos');
      return;
    }
    this.adapter.update(this.selectedRecord.id_salary_tabulator, this.editForm.value).subscribe({
      next: () => {
        this.toastr.success('Registro actualizado');
        this.closeModal('editarTabuladorModal');
        this.load();
      },
      error: () => this.toastr.error('Error al actualizar el registro')
    });
  }

  delete(id: number | undefined): void {
    if (!id) return;
    if (!confirm('¿Seguro de eliminar este registro?')) return;
    this.adapter.delete(id).subscribe({
      next: () => {
        this.toastr.success('Registro eliminado');
        this.load();
      },
      error: () => this.toastr.error('Error al eliminar el registro')
    });
  }

  openModal(id: string): void {
    const el = document.getElementById(id);
    if (el) new (window as any).bootstrap.Modal(el).show();
  }

  closeModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap.Modal.getInstance(el)?.hide();
  }
}
