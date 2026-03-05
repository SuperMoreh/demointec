export class InventoryMovement {
  private id_movement: number | undefined;
  private id_inventory: string | undefined;
  private movement_type: string | undefined;
  private quantity: number | undefined;
  private reason: string | undefined;
  private id_employee: string | undefined;
  private responsible: string | undefined;
  private movement_date: string | undefined;
  private observations: string | undefined;

  public get getId(): number | undefined { return this.id_movement; }
  public set setId(id_movement: number | undefined) { this.id_movement = id_movement; }

  public get getIdInventory(): string | undefined { return this.id_inventory; }
  public set setIdInventory(id_inventory: string | undefined) { this.id_inventory = id_inventory; }

  public get getMovementType(): string | undefined { return this.movement_type; }
  public set setMovementType(movement_type: string | undefined) { this.movement_type = movement_type; }

  public get getQuantity(): number | undefined { return this.quantity; }
  public set setQuantity(quantity: number | undefined) { this.quantity = quantity; }

  public get getReason(): string | undefined { return this.reason; }
  public set setReason(reason: string | undefined) { this.reason = reason; }

  public get getIdEmployee(): string | undefined { return this.id_employee; }
  public set setIdEmployee(id_employee: string | undefined) { this.id_employee = id_employee; }

  public get getResponsible(): string | undefined { return this.responsible; }
  public set setResponsible(responsible: string | undefined) { this.responsible = responsible; }

  public get getMovementDate(): string | undefined { return this.movement_date; }
  public set setMovementDate(movement_date: string | undefined) { this.movement_date = movement_date; }

  public get getObservations(): string | undefined { return this.observations; }
  public set setObservations(observations: string | undefined) { this.observations = observations; }
}
