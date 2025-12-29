import database from "../../../config/db";
import { LaborEventEntity } from "../entity/labor-event.entity";
import { EmployeeUniformEntity } from "../entity/employee-uniform.entity";
import { NotFound } from "http-errors";

export class LaborRelationsAdapter {

    // --- Labor Events ---

    async getEvents(id_employee: string): Promise<LaborEventEntity[]> {
        const repository = database.getRepository(LaborEventEntity);
        return repository.find({
            where: { id_employee },
            order: { event_date: "DESC" }
        });
    }

    async createEvent(data: Partial<LaborEventEntity>): Promise<LaborEventEntity> {
        const repository = database.getRepository(LaborEventEntity);
        const event = repository.create(data);
        await repository.save(event);
        return event;
    }

    async deleteEvent(id: number): Promise<void> {
        const repository = database.getRepository(LaborEventEntity);
        const result = await repository.delete(id);
        if (result.affected === 0) {
            throw new NotFound("Evento no encontrado");
        }
    }

    async updateEvent(id: number, data: Partial<LaborEventEntity>): Promise<LaborEventEntity> {
        const repository = database.getRepository(LaborEventEntity);
        let event = await repository.findOne({ where: { id } });

        if (!event) {
            throw new NotFound("Evento no encontrado");
        }

        repository.merge(event, data);
        return repository.save(event);
    }

    // --- Uniforms ---

    async getUniforms(id_employee: string): Promise<EmployeeUniformEntity | null> {
        const repository = database.getRepository(EmployeeUniformEntity);
        return repository.findOne({ where: { id_employee } });
    }

    async saveUniforms(data: Partial<EmployeeUniformEntity> & { id_employee: string }): Promise<EmployeeUniformEntity> {
        const repository = database.getRepository(EmployeeUniformEntity);

        // Check if exists
        let uniforms = await repository.findOne({ where: { id_employee: data.id_employee } });

        if (uniforms) {
            // Update
            repository.merge(uniforms, data);
            return repository.save(uniforms);
        } else {
            // Create
            uniforms = repository.create(data);
            return repository.save(uniforms);
        }
    }
}
