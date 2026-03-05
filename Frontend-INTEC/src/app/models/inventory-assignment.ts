
export interface InventoryAssignment {
  id_assignment?: number;
  id_inventory: string;
  id_employee: string;
  quantity: number;
  assignment_date: string;
  return_date: string;
  state: string;
  responsible: string;
  observations: string;
  status?: boolean;
}
