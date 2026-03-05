export class Inventory {
  private id_inventory: string | undefined;
  private name_inventory: string | undefined;
  private description: string | undefined;
  private category: string | undefined;
  private quantity: number | undefined;
  private unit: string | undefined;
  private location: string | undefined;
  private state: string | undefined;
  private purchase_date: string | undefined;
  private supplier: string | undefined;
  private unit_cost: number | undefined;
  private responsible: string | undefined;
  private minimum_stock: number | undefined;
  private maximum_stock: number | undefined;
  private observations: string | undefined;
  private status: boolean | undefined;

  public get getId(): string | undefined { return this.id_inventory; }
  public set setId(id_inventory: string | undefined) { this.id_inventory = id_inventory; }

  public get getName(): string | undefined { return this.name_inventory; }
  public set setName(name_inventory: string | undefined) { this.name_inventory = name_inventory; }

  public get getDescription(): string | undefined { return this.description; }
  public set setDescription(description: string | undefined) { this.description = description; }

  public get getCategory(): string | undefined { return this.category; }
  public set setCategory(category: string | undefined) { this.category = category; }

  public get getQuantity(): number | undefined { return this.quantity; }
  public set setQuantity(quantity: number | undefined) { this.quantity = quantity; }

  public get getUnit(): string | undefined { return this.unit; }
  public set setUnit(unit: string | undefined) { this.unit = unit; }

  public get getLocation(): string | undefined { return this.location; }
  public set setLocation(location: string | undefined) { this.location = location; }

  public get getState(): string | undefined { return this.state; }
  public set setState(state: string | undefined) { this.state = state; }

  public get getPurchaseDate(): string | undefined { return this.purchase_date; }
  public set setPurchaseDate(purchase_date: string | undefined) { this.purchase_date = purchase_date; }

  public get getSupplier(): string | undefined { return this.supplier; }
  public set setSupplier(supplier: string | undefined) { this.supplier = supplier; }

  public get getUnitCost(): number | undefined { return this.unit_cost; }
  public set setUnitCost(unit_cost: number | undefined) { this.unit_cost = unit_cost; }

  public get getResponsible(): string | undefined { return this.responsible; }
  public set setResponsible(responsible: string | undefined) { this.responsible = responsible; }

  public get getMinimumStock(): number | undefined { return this.minimum_stock; }
  public set setMinimumStock(minimum_stock: number | undefined) { this.minimum_stock = minimum_stock; }

  public get getMaximumStock(): number | undefined { return this.maximum_stock; }
  public set setMaximumStock(maximum_stock: number | undefined) { this.maximum_stock = maximum_stock; }

  public get getObservations(): string | undefined { return this.observations; }
  public set setObservations(observations: string | undefined) { this.observations = observations; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(status: boolean | undefined) { this.status = status; }
}
