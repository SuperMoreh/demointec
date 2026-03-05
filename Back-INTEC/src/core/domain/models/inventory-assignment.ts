export class InventoryAssignment {
  private id_assignment: number | undefined;
  private id_inventory: string | undefined;
  private id_employee: string | undefined;
  private quantity: number | undefined;
  private assignment_date: string | undefined;
  private return_date: string | undefined;
  private state: string | undefined;
  private responsible: string | undefined;
  private observations: string | undefined;
  private status: boolean | undefined;

  public get getId(): number | undefined { return this.id_assignment; }
  public set setId(id_assignment: number | undefined) { this.id_assignment = id_assignment; }

  public get getIdInventory(): string | undefined { return this.id_inventory; }
  public set setIdInventory(id_inventory: string | undefined) { this.id_inventory = id_inventory; }

  public get getIdEmployee(): string | undefined { return this.id_employee; }
  public set setIdEmployee(id_employee: string | undefined) { this.id_employee = id_employee; }

  public get getQuantity(): number | undefined { return this.quantity; }
  public set setQuantity(quantity: number | undefined) { this.quantity = quantity; }

  public get getAssignmentDate(): string | undefined { return this.assignment_date; }
  public set setAssignmentDate(assignment_date: string | undefined) { this.assignment_date = assignment_date; }

  public get getReturnDate(): string | undefined { return this.return_date; }
  public set setReturnDate(return_date: string | undefined) { this.return_date = return_date; }

  public get getState(): string | undefined { return this.state; }
  public set setState(state: string | undefined) { this.state = state; }

  public get getResponsible(): string | undefined { return this.responsible; }
  public set setResponsible(responsible: string | undefined) { this.responsible = responsible; }

  public get getObservations(): string | undefined { return this.observations; }
  public set setObservations(observations: string | undefined) { this.observations = observations; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(status: boolean | undefined) { this.status = status; }
}
