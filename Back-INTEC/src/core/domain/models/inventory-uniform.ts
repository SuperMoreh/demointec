export class InventoryUniform {
  private id_inventory_uniform: number | undefined;
  private id_inventory: string | undefined;
  private size: string | undefined;
  private gender: string | undefined;
  private department: string | undefined;
  private id_employee: string | undefined;
  private delivery_date: string | undefined;
  private estimated_replacement_date: string | undefined;
  private status: boolean | undefined;

  public get getId(): number | undefined { return this.id_inventory_uniform; }
  public set setId(id_inventory_uniform: number | undefined) { this.id_inventory_uniform = id_inventory_uniform; }

  public get getIdInventory(): string | undefined { return this.id_inventory; }
  public set setIdInventory(id_inventory: string | undefined) { this.id_inventory = id_inventory; }

  public get getSize(): string | undefined { return this.size; }
  public set setSize(size: string | undefined) { this.size = size; }

  public get getGender(): string | undefined { return this.gender; }
  public set setGender(gender: string | undefined) { this.gender = gender; }

  public get getDepartment(): string | undefined { return this.department; }
  public set setDepartment(department: string | undefined) { this.department = department; }

  public get getIdEmployee(): string | undefined { return this.id_employee; }
  public set setIdEmployee(id_employee: string | undefined) { this.id_employee = id_employee; }

  public get getDeliveryDate(): string | undefined { return this.delivery_date; }
  public set setDeliveryDate(delivery_date: string | undefined) { this.delivery_date = delivery_date; }

  public get getEstimatedReplacementDate(): string | undefined { return this.estimated_replacement_date; }
  public set setEstimatedReplacementDate(estimated_replacement_date: string | undefined) { this.estimated_replacement_date = estimated_replacement_date; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(status: boolean | undefined) { this.status = status; }
}
