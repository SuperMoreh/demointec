import { RequestDetailsEntity } from "../../infrastructure/entity/request_details.entity";

export type Query = Record<string, any>;

export type Id = string | number;

export interface RequestDetailsRepository<T> {
  create(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
  list(query?: Query): Promise<T[]>;
  get(id: Id, query?: Query): Promise<RequestDetailsEntity[]>;
  remove(id: Id, query?: Query): Promise<RequestDetailsEntity[]>;
  update(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
  syncToFirebase(): Promise<{}>;
  getCurrentFolio(): Promise<number>;
}