
export interface InventoryExtintor {
  id_inventory_extintor?: number;
  id_inventory: string;
  extintor_type: string;
  capacity: string;
  serial_number: string;
  exact_location: string;
  recharge_date: string;
  expiration_date: string;
  last_inspection: string;
  next_inspection: string;
  status?: boolean;
}
