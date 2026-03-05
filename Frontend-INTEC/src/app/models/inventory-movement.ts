
export interface InventoryMovement {
  id_movement?: number;
  id_inventory: string;
  movement_type: string;
  quantity: number;
  reason: string;
  id_employee: string;
  responsible: string;
  movement_date: string;
  observations: string;
}
