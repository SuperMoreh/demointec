import { SalaryTabulatorRepository, Query, Id } from "../../domain/repository/salary-tabulator.repository";
import { SalaryTabulatorEntity } from "../entity/salary-tabulator.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";

export class SalaryTabulatorAdapterRepository implements SalaryTabulatorRepository<SalaryTabulatorEntity> {

    async create(data: Partial<SalaryTabulatorEntity>, query?: Query): Promise<SalaryTabulatorEntity> {
        const repository = database.getRepository(SalaryTabulatorEntity);
        const salaryTabulator = repository.create(data);
        await repository.save(salaryTabulator);
        return salaryTabulator;
    }

    async list(query?: Query): Promise<SalaryTabulatorEntity[]> {
        const repository = database.getRepository(SalaryTabulatorEntity);
        return repository.find({
            order: { geographic_zone: 'ASC', position: 'ASC' }
        });
    }

    async get(id: Id, query?: Query): Promise<SalaryTabulatorEntity> {
        const repository = database.getRepository(SalaryTabulatorEntity);
        const data = await repository.findOne({
            where: { id_salary_tabulator: id as number }
        });
        if (!data) {
            throw new NotFound("No existe el registro en el tabulador con el id proporcionado");
        }
        return data;
    }

    async update(id: Id, data: Partial<SalaryTabulatorEntity>, query?: Query): Promise<SalaryTabulatorEntity> {
        const repository = database.getRepository(SalaryTabulatorEntity);
        await repository.update(id, data);
        return this.get(id);
    }

    async remove(id: Id, query?: Query): Promise<SalaryTabulatorEntity> {
        const repository = database.getRepository(SalaryTabulatorEntity);
        const salaryTabulator = await this.get(id);
        await repository.delete(id);
        return salaryTabulator;
    }
}
