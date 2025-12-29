import { RequestsAdditionalEntity } from "../../infrastructure/entity/requests_additional.entity";

export type Query = Record<string, any>;

export type Id = string | number;

export interface RequestsAdditionalRepository<T> {
  create(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
  list(query?: Query): Promise<T[]>;
  get(id: Id, query?: Query): Promise<RequestsAdditionalEntity[]>;
  remove(id: Id, query?: Query): Promise<RequestsAdditionalEntity[]>;
  update(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
  syncToFirebase(): Promise<{}>;
  getCurrentFolio(): Promise<number>;
}

