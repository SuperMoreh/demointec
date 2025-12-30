import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { RoleAdapterService } from '../../adapters/roles.adapter';
import { Employee } from '../../models/employees';
import { ReportEmployeesService } from '../../services/reports/report_employees.service';
import { JobDescription, JobDescriptionAdapterService } from '../../adapters/job-description.adapter';
import { AttendancesAdapterService } from '../../adapters/attendances.adapter';
import { Attendance } from '../../models/attendances';
import { UploadAdapterService } from '../../adapters/upload.adapter';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class EmployeesComponent implements OnInit {
  employeesForm: FormGroup;
  isEditMode: boolean = false;
  selectedEmployee: Employee | null = null;
  employees: Employee[] = [];
  allEmployees: Employee[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredEmployees: Employee[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;
  jobDescriptions: JobDescription[] = [];
  roles: any[] = [];

  genderOptions = ['Masculino', 'Femenino'];
  maritalStatusOptions = ['Soltero(a)', 'Casado(a)', 'Viudo(a)', 'Divorciado(a)'];
  educationLevelOptions = ['Bachillerato', 'Estudios profesionales', 'Postgrado'];

  childrenCountOptions = [0, 1, 2, 3, 4, 5];

  // Asistencia
  selectedEmployeeForAttendance: Employee | null = null;
  attendanceStartDate: string = '';
  attendanceEndDate: string = '';
  attendanceRecords: any[] = [];
  hasCheckedAttendance: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private employeesAdapterService: EmployeesAdapterService,
    private reportEmployeesService: ReportEmployeesService,
    private jobDescriptionAdapter: JobDescriptionAdapterService,
    private rolesAdapter: RoleAdapterService,
    private attendancesAdapter: AttendancesAdapterService,
    private uploadService: UploadAdapterService
  ) {
    this.employeesForm = this.fb.group({
      name_employee: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      admission_date: [''],
      position: ['', Validators.required], // Added Validators.required
      entry_time: [''],
      exit_time: [''],
      location: [''],
      gender: [''],
      age: [''],
      marital_status: [''],
      education_level: [''],
      ine_code: [''],
      address: [''],
      birth_place: [''],
      birth_date: [''],
      nss: [''],
      rfc: [''],
      curp: [''],
      children_count: [''],
      child1_name: [''],
      child1_birth_date: [''],
      child2_name: [''],
      child2_birth_date: [''],
      child3_name: [''],
      child3_birth_date: [''],
      child4_name: [''],
      child4_birth_date: [''],
      child5_name: [''],
      child5_birth_date: [''],
      beneficiary: [''],
      beneficiary_relationship: [''],
      beneficiary_percentage: [''],
      infonavit_credit_number: [''],
      infonavit_factor: [''],
      blood_type: [''],
      weight: [''],
      height: [''],
      emergency_phone: [''],
      emergency_contact_name: [''],
      emergency_contact_relationship: [''],
      allergies: [''],
      pAut1: [false],
      pAut2: [false],
      pAut3: [false],
      pCapSol: [false],
      pComSol: [false],
      pControlSol: [false],
      pEdCats: [false],
      pEdSol: [false],
      pEstadisticas: [false],
      pHistorial: [false],
      pUsuarios: [false],
      pVerCats: [false],
      pEliminarDocsRH: [false],
      pDescripcionesPuestos: [false],
      status: [true],
      imss_salary: [''],
      base_salary: [''],
      rehire_date: [''],
      rehire_document_path: [''],
      rehire_document_name: [''],
      // UI-only controls for bonuses
      bonus_punctuality: [false],
      bonus_productivity: [false],
      bonus_transport: [false],
      bonus_permanence: [false],
      bonus_hiring: [false],
      bonus_referral: [false]
    });
  }

  ngOnInit(): void {
    this.setCreateMode();
    this.loadJobDescriptions();
    this.loadRoles();

    this.employeesForm.get('birth_date')?.valueChanges.subscribe(date => {
      this.calculateAge(date);
    });

    // Auto-load employees
    this.consultEmployees();
  }

  calculateAge(birthDate: string): void {
    if (!birthDate) {
      this.employeesForm.patchValue({ age: '' }, { emitEvent: false });
      return;
    }
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    this.employeesForm.patchValue({ age: age }, { emitEvent: false });
  }

  loadRoles(): void {
    this.rolesAdapter.getList().subscribe({
      next: (data: any[]) => this.roles = data,
      error: (err: any) => console.error('Error al cargar roles', err)
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeesAdapterService.getList().subscribe({
      next: (data) => {
        this.allEmployees = data;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar empleados', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadJobDescriptions(): void {
    this.jobDescriptionAdapter.getAll().subscribe({
      next: (data) => {
        this.jobDescriptions = data.filter(job => job.status == true || (job.status as any) === 1 || (job.status as any) === '1');
      },
      error: (err) => {
        console.error('Error al cargar descripciones de puesto', err);
      }
    });
  }

  consultEmployees(): void {
    this.hasConsulted = true;
    this.loadEmployees();
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredEmployees.length);
    this.employees = this.filteredEmployees.slice(startIndex, endIndex);
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
    this.employeesForm.reset({
      name_employee: '',
      email: '',
      phone: '',
      role: '',
      admission_date: '',
      position: '',
      entry_time: '',
      exit_time: '',
      location: '',
      gender: '',
      age: '',
      marital_status: '',
      education_level: '',
      ine_code: '',
      address: '',
      birth_place: '',
      birth_date: '',
      nss: '',
      rfc: '',
      curp: '',
      children_count: '',
      child1_name: '',
      child1_birth_date: '',
      child2_name: '',
      child2_birth_date: '',
      child3_name: '',
      child3_birth_date: '',
      child4_name: '',
      child4_birth_date: '',
      child5_name: '',
      child5_birth_date: '',
      beneficiary: '',
      beneficiary_relationship: '',
      beneficiary_percentage: '',
      infonavit_credit_number: '',
      infonavit_factor: '',
      blood_type: '',
      weight: '',
      height: '',
      emergency_phone: '',
      emergency_contact_name: '',
      emergency_contact_relationship: '',
      allergies: '',
      pAut1: false,
      pAut2: false,
      pAut3: false,
      pCapSol: false,
      pComSol: false,
      pControlSol: false,
      pEdCats: false,
      pEdSol: false,
      pEstadisticas: false,
      pHistorial: false,
      pUsuarios: false,
      pVerCats: false,
      status: true,
      imss_salary: '',
      base_salary: '',
      rehire_date: '',
      rehire_document_path: '',
      rehire_document_name: '',
      bonus_punctuality: false,
      bonus_productivity: false,
      bonus_transport: false,
      bonus_permanence: false,
      bonus_hiring: false,
      bonus_referral: false
    });
    this.selectedEmployee = null;
  }

  createEmployee(): void {
    if (this.employeesForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.employeesForm);
      return;
    }
    const employeeData = {
      id_employee: this.generateUUID(),
      name_employee: this.employeesForm.value.name_employee,
      email: this.employeesForm.value.email,
      phone: this.employeesForm.value.phone,
      role: this.employeesForm.value.role,
      admission_date: this.employeesForm.value.admission_date,
      position: this.employeesForm.value.position,
      entry_time: this.employeesForm.value.entry_time,
      exit_time: this.employeesForm.value.exit_time,
      location: this.employeesForm.value.location,
      gender: this.employeesForm.value.gender,
      age: this.employeesForm.value.age,
      marital_status: this.employeesForm.value.marital_status,
      education_level: this.employeesForm.value.education_level,
      ine_code: this.employeesForm.value.ine_code,
      address: this.employeesForm.value.address,
      birth_place: this.employeesForm.value.birth_place,
      birth_date: this.employeesForm.value.birth_date,
      nss: this.employeesForm.value.nss,
      rfc: this.employeesForm.value.rfc,
      curp: this.employeesForm.value.curp,
      children_count: this.employeesForm.value.children_count,
      child1_name: this.employeesForm.value.child1_name,
      child1_birth_date: this.employeesForm.value.child1_birth_date,
      child2_name: this.employeesForm.value.child2_name,
      child2_birth_date: this.employeesForm.value.child2_birth_date,
      child3_name: this.employeesForm.value.child3_name,
      child3_birth_date: this.employeesForm.value.child3_birth_date,
      child4_name: this.employeesForm.value.child4_name,
      child4_birth_date: this.employeesForm.value.child4_birth_date,
      child5_name: this.employeesForm.value.child5_name,
      child5_birth_date: this.employeesForm.value.child5_birth_date,
      beneficiary: this.employeesForm.value.beneficiary,
      beneficiary_relationship: this.employeesForm.value.beneficiary_relationship,
      beneficiary_percentage: this.employeesForm.value.beneficiary_percentage,
      infonavit_credit_number: this.employeesForm.value.infonavit_credit_number,
      infonavit_factor: this.employeesForm.value.infonavit_factor,
      blood_type: this.employeesForm.value.blood_type,
      weight: this.employeesForm.value.weight,
      height: this.employeesForm.value.height,
      emergency_phone: this.employeesForm.value.emergency_phone,
      emergency_contact_name: this.employeesForm.value.emergency_contact_name,
      emergency_contact_relationship: this.employeesForm.value.emergency_contact_relationship,
      allergies: this.employeesForm.value.allergies,
      pAut1: this.employeesForm.value.pAut1 ? '1' : '0',
      pAut2: this.employeesForm.value.pAut2 ? '1' : '0',
      pAut3: this.employeesForm.value.pAut3 ? '1' : '0',
      pCapSol: this.employeesForm.value.pCapSol ? '1' : '0',
      pComSol: this.employeesForm.value.pComSol ? '1' : '0',
      pControlSol: this.employeesForm.value.pControlSol ? '1' : '0',
      pEdCats: this.employeesForm.value.pEdCats ? '1' : '0',
      pEdSol: this.employeesForm.value.pEdSol ? '1' : '0',
      pEstadisticas: this.employeesForm.value.pEstadisticas ? '1' : '0',
      pHistorial: this.employeesForm.value.pHistorial ? '1' : '0',
      pUsuarios: this.employeesForm.value.pUsuarios ? '1' : '0',
      pVerCats: this.employeesForm.value.pVerCats ? '1' : '0',
      pEliminarDocsRH: this.employeesForm.value.pEliminarDocsRH ? '1' : '0',
      status: this.employeesForm.value.status,
      imss_salary: this.employeesForm.value.imss_salary || null,
      base_salary: this.employeesForm.value.base_salary || null,

      bonuses: this.getBonusesString()
    };
    this.employeesAdapterService.post(employeeData).subscribe({
      next: () => {
        this.toastr.success('Empleado creado correctamente', 'Éxito');
        this.setCreateMode();
        this.hasConsulted = true;
        this.loadEmployees();
        this.closeAddModal();
      },
      error: err => {
        console.error('Error al guardar empleado', err);
        this.toastr.error('Error al crear el empleado', 'Error');
      }
    });
  }

  viewEmployee(employee: Employee): void {
    this.selectedEmployee = employee;

    // Fetch full details including rehire document
    if (employee.id_employee) {
      this.employeesAdapterService.get(employee.id_employee).subscribe({
        next: (fullData) => {
          console.log('Full Employee Data:', fullData);
          this.selectedEmployee = fullData;
        },
        error: (err) => console.error('Error fetching details', err)
      });
    }

    setTimeout(() => {
      const modal = document.getElementById('visualizarEmpleado');
      if (modal) {
        const closeButton = modal.querySelector('.btn-close') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }
    }, 300);
  }

  openEditModal(employee: Employee): void {
    this.isEditMode = true;
    this.selectedEmployee = employee;

    // Fetch fresh data for edit
    if (employee.id_employee) {
      this.employeesAdapterService.get(employee.id_employee).subscribe({
        next: (fullData) => {
          this.selectedEmployee = fullData;
          this.employeesForm.patchValue({
            // Patch fields that might be missing in list view (e.g. rehire stuff)
            rehire_date: fullData.rehire_date,
            rehire_document_path: fullData.rehire_document_path,
            rehire_document_name: fullData.rehire_document_name,
            // Patch others to be sure
            imss_salary: fullData.imss_salary,
            base_salary: fullData.base_salary,
            bonuses: fullData.bonuses
          });
          // Re-parse bonuses checkboxes
          this.employeesForm.patchValue({
            bonus_punctuality: fullData.bonuses?.includes('Puntualidad y asistencia'),
            bonus_productivity: fullData.bonuses?.includes('Productividad'),
            bonus_transport: fullData.bonuses?.includes('Transporte'),
            bonus_permanence: fullData.bonuses?.includes('Permanencia'),
            bonus_hiring: fullData.bonuses?.includes('Contratación'),
            bonus_referral: fullData.bonuses?.includes('Recomendación')
          });
        }
      });
    }

    this.employeesForm.patchValue({
      name_employee: employee.name_employee,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      admission_date: employee.admission_date,
      position: employee.position,
      entry_time: employee.entry_time,
      exit_time: employee.exit_time,
      location: employee.location,
      gender: employee.gender,
      age: employee.age,
      marital_status: employee.marital_status,
      education_level: employee.education_level,
      ine_code: employee.ine_code,
      address: employee.address,
      birth_place: employee.birth_place,
      birth_date: employee.birth_date,
      nss: employee.nss,
      rfc: employee.rfc,
      curp: employee.curp,
      children_count: employee.children_count,
      child1_name: employee.child1_name,
      child1_birth_date: employee.child1_birth_date,
      child2_name: employee.child2_name,
      child2_birth_date: employee.child2_birth_date,
      child3_name: employee.child3_name,
      child3_birth_date: employee.child3_birth_date,
      child4_name: employee.child4_name,
      child4_birth_date: employee.child4_birth_date,
      child5_name: employee.child5_name,
      child5_birth_date: employee.child5_birth_date,
      beneficiary: employee.beneficiary,
      beneficiary_relationship: employee.beneficiary_relationship,
      beneficiary_percentage: employee.beneficiary_percentage,
      infonavit_credit_number: employee.infonavit_credit_number,
      infonavit_factor: employee.infonavit_factor,
      blood_type: employee.blood_type,
      weight: employee.weight,
      height: employee.height,
      emergency_phone: employee.emergency_phone,
      emergency_contact_name: employee.emergency_contact_name,
      emergency_contact_relationship: employee.emergency_contact_relationship,
      allergies: employee.allergies,
      pAut1: employee.pAut1 === '1',
      pAut2: employee.pAut2 === '1',
      pAut3: employee.pAut3 === '1',
      pCapSol: employee.pCapSol === '1',
      pComSol: employee.pComSol === '1',
      pControlSol: employee.pControlSol === '1',
      pEdCats: employee.pEdCats === '1',
      pEdSol: employee.pEdSol === '1',
      pEstadisticas: employee.pEstadisticas === '1',
      pHistorial: employee.pHistorial === '1',
      pUsuarios: employee.pUsuarios === '1',
      pVerCats: employee.pVerCats === '1',
      pEliminarDocsRH: employee.pEliminarDocsRH === '1',
      pDescripcionesPuestos: employee.pDescripcionesPuestos === '1',
      status: employee.status,
      imss_salary: employee.imss_salary,
      base_salary: employee.base_salary,
      rehire_date: employee.rehire_date,
      rehire_document_path: employee.rehire_document_path,
      rehire_document_name: employee.rehire_document_name,
      bonus_punctuality: employee.bonuses?.includes('Puntualidad y asistencia'),
      bonus_productivity: employee.bonuses?.includes('Productividad'),
      bonus_transport: employee.bonuses?.includes('Transporte'),
      bonus_permanence: employee.bonuses?.includes('Permanencia'),
      bonus_hiring: employee.bonuses?.includes('Contratación'),
      bonus_referral: employee.bonuses?.includes('Recomendación')
    });
  }

  handleEditClick(employee: Employee): void {
    this.openEditModal(employee);
    const modal = document.getElementById('editarEmpleadoModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
      setTimeout(() => {
        const firstInput = modal.querySelector('input[formControlName="name_employee"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  updateEmployee(): void {
    if (!this.selectedEmployee?.id_employee) {
      this.toastr.error('No hay empleado seleccionado para editar', 'Error');
      return;
    }
    const nameControl = this.employeesForm.get('name_employee');
    const emailControl = this.employeesForm.get('email');
    const phoneControl = this.employeesForm.get('phone');
    const positionControl = this.employeesForm.get('position');

    if (!nameControl?.value || !emailControl?.value || !phoneControl?.value || !positionControl?.value) {
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.employeesForm);
      return;
    }
    const employeeId = this.selectedEmployee.id_employee;
    const proceedWithUpdate = (path?: string) => {
      const employeeData: any = {
        name_employee: this.employeesForm.value.name_employee,
        email: this.employeesForm.value.email,
        phone: this.employeesForm.value.phone,
        role: this.employeesForm.value.role,
        admission_date: this.employeesForm.value.admission_date,
        position: this.employeesForm.value.position,
        entry_time: this.employeesForm.value.entry_time,
        exit_time: this.employeesForm.value.exit_time,
        location: this.employeesForm.value.location,
        gender: this.employeesForm.value.gender,
        age: this.employeesForm.value.age,
        marital_status: this.employeesForm.value.marital_status,
        education_level: this.employeesForm.value.education_level,
        ine_code: this.employeesForm.value.ine_code,
        address: this.employeesForm.value.address,
        birth_place: this.employeesForm.value.birth_place,
        birth_date: this.employeesForm.value.birth_date,
        nss: this.employeesForm.value.nss,
        rfc: this.employeesForm.value.rfc,
        curp: this.employeesForm.value.curp,
        children_count: this.employeesForm.value.children_count,
        child1_name: this.employeesForm.value.child1_name,
        child1_birth_date: this.employeesForm.value.child1_birth_date,
        child2_name: this.employeesForm.value.child2_name,
        child2_birth_date: this.employeesForm.value.child2_birth_date,
        child3_name: this.employeesForm.value.child3_name,
        child3_birth_date: this.employeesForm.value.child3_birth_date,
        child4_name: this.employeesForm.value.child4_name,
        child4_birth_date: this.employeesForm.value.child4_birth_date,
        child5_name: this.employeesForm.value.child5_name,
        child5_birth_date: this.employeesForm.value.child5_birth_date,
        beneficiary: this.employeesForm.value.beneficiary,
        beneficiary_relationship: this.employeesForm.value.beneficiary_relationship,
        beneficiary_percentage: this.employeesForm.value.beneficiary_percentage,
        infonavit_credit_number: this.employeesForm.value.infonavit_credit_number,
        infonavit_factor: this.employeesForm.value.infonavit_factor,
        blood_type: this.employeesForm.value.blood_type,
        weight: this.employeesForm.value.weight,
        height: this.employeesForm.value.height,
        emergency_phone: this.employeesForm.value.emergency_phone,
        emergency_contact_name: this.employeesForm.value.emergency_contact_name,
        emergency_contact_relationship: this.employeesForm.value.emergency_contact_relationship,
        allergies: this.employeesForm.value.allergies,
        pAut1: this.employeesForm.value.pAut1 ? '1' : '0',
        pAut2: this.employeesForm.value.pAut2 ? '1' : '0',
        pAut3: this.employeesForm.value.pAut3 ? '1' : '0',
        pCapSol: this.employeesForm.value.pCapSol ? '1' : '0',
        pComSol: this.employeesForm.value.pComSol ? '1' : '0',
        pControlSol: this.employeesForm.value.pControlSol ? '1' : '0',
        pEdCats: this.employeesForm.value.pEdCats ? '1' : '0',
        pEdSol: this.employeesForm.value.pEdSol ? '1' : '0',
        pEstadisticas: this.employeesForm.value.pEstadisticas ? '1' : '0',
        pHistorial: this.employeesForm.value.pHistorial ? '1' : '0',
        pUsuarios: this.employeesForm.value.pUsuarios ? '1' : '0',
        pVerCats: this.employeesForm.value.pVerCats ? '1' : '0',
        pEliminarDocsRH: this.employeesForm.value.pEliminarDocsRH ? '1' : '0',
        pDescripcionesPuestos: this.employeesForm.value.pDescripcionesPuestos ? '1' : '0',
        status: this.employeesForm.value.status,
        imss_salary: this.employeesForm.value.imss_salary || null,
        base_salary: this.employeesForm.value.base_salary || null,
        rehire_date: this.employeesForm.value.rehire_date,
        rehire_document_path: path || this.employeesForm.value.rehire_document_path,
        rehire_document_name: this.employeesForm.value.rehire_document_name,
        bonuses: this.getBonusesString()
      };

      this.employeesAdapterService.put(employeeId, employeeData).subscribe({
        next: () => {
          this.toastr.success('Empleado actualizado correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadEmployees();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: err => {
          console.error('Error al actualizar empleado:', err);
          this.toastr.error('Error al actualizar el empleado', 'Error');
        }
      });
    };

    if (this.selectedFile) {
      this.uploadService.uploadFile(this.selectedFile).subscribe({
        next: (response) => {
          proceedWithUpdate(response.path);
        },
        error: (err) => {
          console.error('Error uploading file', err);
          this.toastr.error('Error al subir el archivo', 'Error');
        }
      });
    } else {
      proceedWithUpdate();
    }
  }

  // Helper for file selection
  selectedFile: File | null = null;
  onRehireFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  deleteEmployee(employee: Employee): void {
    if (!employee.id_employee) {
      this.toastr.error('No se puede eliminar el empleado: ID no válido', 'Error');
      return;
    }
    if (confirm(`¿Está seguro que desea eliminar el empleado "${employee.name_employee}"?`)) {
      this.employeesAdapterService.delete(employee.id_employee).subscribe({
        next: () => {
          this.toastr.success('Empleado eliminado correctamente', 'Éxito');
          this.hasConsulted = true;
          this.loadEmployees();
        },
        error: err => {
          console.error('Error al eliminar empleado:', err);
          this.toastr.error('Error al eliminar el empleado', 'Error');
        }
      });
    }
  }

  applyFilters(): void {
    if (!this.hasConsulted) {
      return;
    }
    this.filteredEmployees = this.allEmployees.filter(emp => {
      const searchMatch = !this.searchTerm ||
        emp.name_employee.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.phone.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(this.searchTerm.toLowerCase());
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = emp.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = emp.status === false;
      } else {
        statusMatch = emp.status === true;
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
    this.filteredEmployees = this.allEmployees.filter(emp => emp.status === true);
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
    this.closeModal('agregarEmpleadoModal');
  }

  closeEditModal(): void {
    this.closeModal('editarEmpleadoModal');
  }

  closeViewModal(): void {
    this.closeModal('visualizarEmpleado');
  }

  async exportEmployees(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      const employeesToExport = this.filteredEmployees;
      await this.reportEmployeesService.generateEmployeesReport(employeesToExport, 'CATÁLOGO DE EMPLEADOS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

  syncFromFirebase(): void {
    this.isLoading = true;
    this.employeesAdapterService.syncToFirebase().subscribe({
      next: (res) => {
        this.toastr.success('Sincronización completada correctamente', 'Éxito');
        this.hasConsulted = true;
        this.loadEmployees();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Error al sincronizar desde Firebase', 'Error');
        console.error(err);
      }
    });
  }

  syncEmployees(): void {
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Lógica para Control de Asistencia
  openAttendanceModal(employee: Employee): void {
    this.selectedEmployeeForAttendance = employee;
    this.attendanceStartDate = '';
    this.attendanceEndDate = '';
    this.attendanceRecords = [];
    this.hasCheckedAttendance = false;

    setTimeout(() => {
      const modal = document.getElementById('asistenciaModal');
      if (modal) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
      }
    }, 100);
  }

  checkAttendance(): void {
    if (!this.selectedEmployeeForAttendance || !this.attendanceStartDate || !this.attendanceEndDate) {
      this.toastr.warning('Seleccione un empleado y un rango de fechas.', 'Advertencia');
      return;
    }

    if (!this.selectedEmployeeForAttendance.id_employee) {
      this.toastr.error('El empleado seleccionado no tiene UUID válido.', 'Error');
      return;
    }

    this.isLoading = true;
    this.attendancesAdapter.getByDateRange(this.selectedEmployeeForAttendance.id_employee, this.attendanceStartDate, this.attendanceEndDate).subscribe({
      next: (data: Attendance[]) => {
        this.isLoading = false;
        this.hasCheckedAttendance = true;
        this.processAttendanceRecords(data);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al consultar asistencias:', err);
        this.toastr.error('Error al consultar asistencias.', 'Error');
      }
    });
  }

  processAttendanceRecords(records: Attendance[]) {
    if (!this.selectedEmployeeForAttendance) return;

    const entryTimeStr = this.selectedEmployeeForAttendance.entry_time; // HH:mm

    // Filtrar solo registros de entrada - REMOVED to show all records per user request
    // const entryRecords = records.filter(r => r.type === 'Entrada');

    this.attendanceRecords = records.map(record => {
      let statusLabel = ''; // Default empty

      // Only calculate status for 'Entrada'
      if (record.type === 'Entrada') {
        statusLabel = 'Falta'; // Default if checking fails

        // Si hay registro de asistencia, evaluar puntualidad
        if (record && record.hour && entryTimeStr) {
          const entryTime = this.parseTime(entryTimeStr);
          const checkInTime = this.parseTime(record.hour);

          if (entryTime && checkInTime) {
            // Calcular diferencia en minutos
            const diffMinutes = (checkInTime.getTime() - entryTime.getTime()) / 60000;

            if (diffMinutes <= 15) {
              statusLabel = 'A tiempo';
            } else {
              statusLabel = 'Retardo';
            }
          } else {
            statusLabel = 'Error H.';
          }
        } else if (record && record.hour && !entryTimeStr) {
          statusLabel = 'Sin H. Entrada';
        }
      } else {
        // For 'Salida' or others, we can either show the type or leave status empty
        // Request says: "cálculo ... es solo para la entrada"
        statusLabel = '-';
      }

      return {
        ...record,
        statusLabel: statusLabel
      };
    });
  }

  private parseTime(timeStr: string): Date | null {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  getBonusesString(): string {
    const bonuses = [];
    if (this.employeesForm.value.bonus_punctuality) bonuses.push('Puntualidad y asistencia');
    if (this.employeesForm.value.bonus_productivity) bonuses.push('Productividad');
    if (this.employeesForm.value.bonus_transport) bonuses.push('Transporte');
    if (this.employeesForm.value.bonus_permanence) bonuses.push('Permanencia');
    if (this.employeesForm.value.bonus_hiring) bonuses.push('Contratación');
    if (this.employeesForm.value.bonus_referral) bonuses.push('Recomendación');
    return bonuses.join(', ');
  }
} 