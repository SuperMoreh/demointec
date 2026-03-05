
export interface Inventory {
  id_inventory?: string;
  name_inventory: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  state: string;
  purchase_date: string;
  supplier: string;
  unit_cost: number;
  responsible: string;
  minimum_stock: number;
  maximum_stock: number;
  observations: string;
  status: boolean;
}
