import { DisabilityRepository, Query, Id } from "../../domain/repository/disability.repository";
import { DisabilityEntity } from "../entity/disability.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";

export class DisabilityAdapterRepository implements DisabilityRepository<DisabilityEntity> {

    async create(data: Partial<DisabilityEntity>, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        const disability = repository.create(data);
        await repository.save(disability);
        return disability;
    }

    async list(query?: Query): Promise<DisabilityEntity[]> {
        const repository = database.getRepository(DisabilityEntity);
        return repository.find({
            relations: ['employee'],
            order: { created_at: 'DESC' }
        });
    }

    async get(id: Id, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        const data = await repository.findOne({
            where: { id: id as number },
            relations: ['employee']
        });
        if (!data) {
            throw new NotFound("No existe la incapacidad con el id proporcionado");
        }
        return data;
    }

    async update(id: Id, data: Partial<DisabilityEntity>, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        await repository.update(id, data);
        return this.get(id);
    }

    async remove(id: Id, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        const disability = await this.get(id);
        await repository.delete(id);
        return disability;
    }
}
