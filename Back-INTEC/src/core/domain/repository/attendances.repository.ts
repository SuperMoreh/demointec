export type Query = Record<string, any>; // forced update

export type Id = string | number;

export interface AttendanceRepository<T> {
  create(data: Partial<T>, query?: Query): Promise<T>;
  list(query?: Query): Promise<T[]>;
  get(id: Id, query?: Query): Promise<T>;
  remove(id: Id, query?: Query): Promise<T>;
  syncToFirebase(): Promise<{}>;
  getByUserAndDateRange(uuid: string, startDate: string, endDate: string): Promise<T[]>;
}