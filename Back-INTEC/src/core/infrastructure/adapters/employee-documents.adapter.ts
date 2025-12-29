import { AppDataSource } from "../../../config/db";
import { EmployeeDocumentEntity } from "../entity/employee-documents.entity";

export class EmployeeDocumentsAdapter {
    async getDocumentsByEmployee(employeeId: string): Promise<EmployeeDocumentEntity[]> {
        const repository = AppDataSource.getRepository(EmployeeDocumentEntity);
        return await repository.find({
            where: { id_employee: employeeId }
        });
    }

    async saveDocument(data: Partial<EmployeeDocumentEntity>): Promise<EmployeeDocumentEntity> {
        const repository = AppDataSource.getRepository(EmployeeDocumentEntity);

        // Check if document of this type already exists for the employee to update it or create new
        // The requirement implies one document per type per employee usually, but let's see. 
        // If I upload "CURP" again, it should probably replace the old one or just add a new record?
        // User said "Consultar documentos... se deben marcar con un check si ya se subieron".
        // Usually simplest is to just save. But if I want to "replace", I should check.
        // Let's assume we create a new record or update. 
        // For simplicity and history, maybe just create. But to "check if uploaded", we just look for any.
        // To keep it clean, let's update if exists, or simple create. 
        // Let's stick to simple create for now, maybe finding the latest one is enough for the frontend.
        // Actually, if I upload a new one, it's better to update the existing record if we consider "Type" unique.
        // Let's try to find existing one by type and employee.

        const existing = await repository.findOne({
            where: {
                id_employee: data.id_employee,
                document_type: data.document_type
            }
        });

        if (existing) {
            // Update
            repository.merge(existing, data);
            return await repository.save(existing);
        } else {
            // Create
            const doc = repository.create(data);
            return await repository.save(doc);
        }
    }

    async deleteDocument(id: number): Promise<void> {
        const repository = AppDataSource.getRepository(EmployeeDocumentEntity);
        await repository.delete(id);
    }
}
