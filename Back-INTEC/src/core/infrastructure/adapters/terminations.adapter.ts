import { TerminationRepository, Query, Id } from "../../domain/repository/terminations.repository";
import { TerminationEntity } from "../entity/terminations.entity";
import { LaborEventEntity } from "../entity/labor-event.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";

import { EmployeeDocumentEntity } from "../entity/employee-documents.entity";
import { EmployeeEntity } from "../entity/employees.entity";

export class TerminationAdapterRepository implements TerminationRepository<TerminationEntity> {

    async create(data: Partial<TerminationEntity>, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const laborEventRepository = database.getRepository(LaborEventEntity);
        const documentRepository = database.getRepository(EmployeeDocumentEntity);
        const employeeRepository = database.getRepository(EmployeeEntity);

        // 1. Create Termination Record
        const termination = repository.create(data);
        await repository.save(termination);
        console.log("[DEBUG] Termination created with ID:", termination.id);

        // 2. Sync to Labor Relations (Create Event)
        try {
            const laborEvent = laborEventRepository.create({
                id_employee: termination.id_employee,
                event_date: termination.last_work_day,
                event_name: 'Baja de Personal',
                observation: `Motivo: ${termination.reason}. Observación: ${termination.observation || ''}. Documento: ${termination.document_name || 'Sin nombre'}. ID Baja: ${termination.id}`,
                document_path: termination.document_path // Sync document to labor event too
            });
            await laborEventRepository.save(laborEvent);
            console.log("[DEBUG] Labor Event created synced to termination.");

            // 3. Update Termination with Labor Event ID
            termination.labor_event_id = laborEvent.id;
            await repository.save(termination);
        } catch (error) {
            console.error("[CRITICAL ERROR] Error creating synced Labor Event:", error);
        }

        // 4. Update Employee Status to Inactive (False)
        try {
            const employee = await employeeRepository.findOne({ where: { id_employee: termination.id_employee } });
            if (employee) {
                employee.status = false;
                await employeeRepository.save(employee);
                console.log(`[DEBUG] Employee ${employee.name_employee} status set to INACTIVE.`);
            } else {
                console.warn(`[WARNING] Employee with ID ${termination.id_employee} not found for status update.`);
            }
        } catch (error) {
            console.error("[CRITICAL ERROR] Error updating employee status:", error);
        }

        // 5. Sync to Document Repository (if file exists)
        if (termination.document_path) {
            console.log("[DEBUG] Syncing CREATE to Document Repository. Path:", termination.document_path);
            try {
                const doc = documentRepository.create({
                    id_employee: termination.id_employee,
                    document_type: (termination.document_name || 'Baja').substring(0, 50),
                    document_path: termination.document_path
                });
                await documentRepository.save(doc);
                console.log("[DEBUG] Document saved successfully on create.");
            } catch (error) {
                console.error("[CRITICAL ERROR] Error creating synced Document:", error);
            }
        } else {
            console.log("[DEBUG] No document_path for creation, skipping doc sync.");
        }

        return termination;
    }

    async list(query?: Query): Promise<TerminationEntity[]> {
        const repository = database.getRepository(TerminationEntity);
        return repository.find({
            relations: ['employee'],
            order: { created_at: 'DESC' }
        });
    }

    async get(id: Id, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const termination = await repository.findOne({ where: { id: Number(id) } });

        if (!termination) {
            throw new NotFound("No existe la baja con el id proporcionado");
        }
        return termination;
    }

    async update(id: Id, data: Partial<TerminationEntity>, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const laborEventRepository = database.getRepository(LaborEventEntity);

        // 1. Update Termination Record
        await repository.update(id, data);
        const updatedTermination = await this.get(id);

        // 2. Sync to Labor Relations (Update Event)
        if (updatedTermination.labor_event_id) {
            try {
                await laborEventRepository.update(updatedTermination.labor_event_id, {
                    event_date: updatedTermination.last_work_day,
                    observation: `Motivo: ${updatedTermination.reason}. Observación: ${updatedTermination.observation || ''}. Documento: ${updatedTermination.document_name || 'Sin nombre'}. ID Baja: ${updatedTermination.id}`,
                    document_path: updatedTermination.document_path
                });
            } catch (error) {
                console.error("Error updating synced Labor Event:", error);
            }
        }

        // 3. Sync to Document Repository (if file exists and is new or updated)
        if (data.document_path) {
            console.log("[DEBUG] Syncing UPDATE to Document Repository. Path:", data.document_path);
            const documentRepository = database.getRepository(EmployeeDocumentEntity);
            try {
                const doc = documentRepository.create({
                    id_employee: updatedTermination.id_employee,
                    document_type: (updatedTermination.document_name || 'Baja (Actualización)').substring(0, 50),
                    document_path: updatedTermination.document_path
                });
                await documentRepository.save(doc);
                console.log("[DEBUG] Document saved successfully on update.");
            } catch (error) {
                console.error("[CRITICAL ERROR] Error creating synced Document on update:", error);
            }
        } else {
            console.log("[DEBUG] No document_path in update data, skipping sync.");
        }

        return updatedTermination;
    }

    async remove(id: Id, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const laborEventRepository = database.getRepository(LaborEventEntity);

        const terminationToDelete = await this.get(id);

        // 1. Delete Synced Labor Event
        if (terminationToDelete.labor_event_id) {
            try {
                await laborEventRepository.delete(terminationToDelete.labor_event_id);
            } catch (error) {
                console.error("Error deleting synced Labor Event:", error);
            }
        }

        // 2. Delete Termination Record
        await repository.delete(id);

        return terminationToDelete;
    }
}
