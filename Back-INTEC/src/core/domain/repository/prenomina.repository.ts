export type Query = Record<string, any>;

export interface PrenominaRepository {
  getList(startDate: string, endDate: string): Promise<any[]>;
}
