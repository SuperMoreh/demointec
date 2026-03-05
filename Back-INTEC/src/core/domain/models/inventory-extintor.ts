export class InventoryExtintor {
  private id_inventory_extintor: number | undefined;
  private id_inventory: string | undefined;
  private extintor_type: string | undefined;
  private capacity: string | undefined;
  private serial_number: string | undefined;
  private exact_location: string | undefined;
  private recharge_date: string | undefined;
  private expiration_date: string | undefined;
  private last_inspection: string | undefined;
  private next_inspection: string | undefined;
  private status: boolean | undefined;

  public get getId(): number | undefined { return this.id_inventory_extintor; }
  public set setId(id_inventory_extintor: number | undefined) { this.id_inventory_extintor = id_inventory_extintor; }

  public get getIdInventory(): string | undefined { return this.id_inventory; }
  public set setIdInventory(id_inventory: string | undefined) { this.id_inventory = id_inventory; }

  public get getExtintorType(): string | undefined { return this.extintor_type; }
  public set setExtintorType(extintor_type: string | undefined) { this.extintor_type = extintor_type; }

  public get getCapacity(): string | undefined { return this.capacity; }
  public set setCapacity(capacity: string | undefined) { this.capacity = capacity; }

  public get getSerialNumber(): string | undefined { return this.serial_number; }
  public set setSerialNumber(serial_number: string | undefined) { this.serial_number = serial_number; }

  public get getExactLocation(): string | undefined { return this.exact_location; }
  public set setExactLocation(exact_location: string | undefined) { this.exact_location = exact_location; }

  public get getRechargeDate(): string | undefined { return this.recharge_date; }
  public set setRechargeDate(recharge_date: string | undefined) { this.recharge_date = recharge_date; }

  public get getExpirationDate(): string | undefined { return this.expiration_date; }
  public set setExpirationDate(expiration_date: string | undefined) { this.expiration_date = expiration_date; }

  public get getLastInspection(): string | undefined { return this.last_inspection; }
  public set setLastInspection(last_inspection: string | undefined) { this.last_inspection = last_inspection; }

  public get getNextInspection(): string | undefined { return this.next_inspection; }
  public set setNextInspection(next_inspection: string | undefined) { this.next_inspection = next_inspection; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(status: boolean | undefined) { this.status = status; }
}
