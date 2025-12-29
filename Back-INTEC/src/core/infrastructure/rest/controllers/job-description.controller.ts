import { Request, Response } from "express";
import { JobDescriptionAdapter } from "../../adapters/job-description.adapter";
import { EmployeeEntity } from "../../entity/employees.entity";
import { EmployeeDocumentEntity } from "../../entity/employee-documents.entity";
import database from "../../../../config/db";

export class JobDescriptionController {
    constructor(private adapter: JobDescriptionAdapter) { }

    async getAll(req: Request, res: Response) {
        try {
            const jobs = await this.adapter.getAll();
            res.json(jobs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener descripciones de puesto" });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const job = await this.adapter.getById(Number(id));
            if (!job) return res.status(404).json({ message: "Descripción de puesto no encontrada" });
            res.json(job);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener descripción de puesto" });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newJob = await this.adapter.create(req.body);

            // Propagate documents to employees
            if (newJob && newJob.required_documents) {
                this.propagateDocumentsToEmployees(newJob.job_title, newJob.required_documents);
            }

            res.json(newJob);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al crear descripción de puesto" });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Get existing job to check for removed documents
            const oldJob = await this.adapter.getById(Number(id));

            const updatedJob = await this.adapter.update(Number(id), req.body);
            if (!updatedJob) return res.status(404).json({ message: "Descripción de puesto no encontrada" });

            // Handle document removals
            if (oldJob && oldJob.required_documents) {
                await this.handleDocumentRemovals(oldJob.job_title, oldJob.required_documents, updatedJob.required_documents || '[]');
            }

            // Propagate documents to employees
            if (updatedJob && updatedJob.required_documents) {
                this.propagateDocumentsToEmployees(updatedJob.job_title, updatedJob.required_documents);
            }

            res.json(updatedJob);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al actualizar descripción de puesto" });
        }
    }

    private async handleDocumentRemovals(jobTitle: string, oldDocsStr: string, newDocsStr: string) {
        try {
            console.log(`[handleDocumentRemovals] Checking removals for position: '${jobTitle}'`);
            let oldDocs: any[] = [];
            let newDocs: any[] = [];

            try {
                oldDocs = JSON.parse(oldDocsStr);
                newDocs = JSON.parse(newDocsStr);
            } catch (e) {
                console.error("[handleDocumentRemovals] Error parsing JSON", e);
                return;
            }

            if (!Array.isArray(oldDocs)) return;
            if (!Array.isArray(newDocs)) newDocs = [];

            // Extract document names
            const oldNames = oldDocs.map(d => typeof d === 'string' ? d : d.name);
            const newNames = newDocs.map(d => typeof d === 'string' ? d : d.name);

            console.log('[handleDocumentRemovals] Old Docs:', oldNames);
            console.log('[handleDocumentRemovals] New Docs:', newNames);

            // Find removed documents
            const removedDocs = oldNames.filter(name => !newNames.includes(name));

            if (removedDocs.length === 0) {
                console.log('[handleDocumentRemovals] No documents to remove.');
                return;
            }

            console.log(`[handleDocumentRemovals] Docs to remove:`, removedDocs);

            const employeeRepo = database.getRepository(EmployeeEntity);
            const employeeDocRepo = database.getRepository(EmployeeDocumentEntity);

            // Find all employees with this position
            const employees = await employeeRepo.find({ where: { position: jobTitle } });
            console.log(`[handleDocumentRemovals] Found ${employees.length} employees with position '${jobTitle}'`);

            for (const employee of employees) {
                for (const docName of removedDocs) {
                    const result = await employeeDocRepo.delete({
                        id_employee: employee.id_employee,
                        document_type: docName
                    });
                    console.log(`[handleDocumentRemovals] Deleted document '${docName}' for employee ${employee.name_employee} (Affected: ${result.affected})`);
                }
            }

        } catch (error) {
            console.error("[handleDocumentRemovals] Error:", error);
        }
    }

    private async propagateDocumentsToEmployees(jobTitle: string, requiredDocumentsStr: string) {
        try {
            let requiredDocs: any[] = [];
            try {
                requiredDocs = JSON.parse(requiredDocumentsStr);
            } catch (e) {
                console.error("Error parsing required_documents JSON", e);
                return;
            }

            if (!Array.isArray(requiredDocs) || requiredDocs.length === 0) return;

            const employeeRepo = database.getRepository(EmployeeEntity);
            const employeeDocRepo = database.getRepository(EmployeeDocumentEntity);

            // Find all employees with this position
            const employees = await employeeRepo.find({ where: { position: jobTitle } });

            for (const employee of employees) {
                for (const item of requiredDocs) {
                    // Handle both string (old) and object (new) formats
                    const docName = typeof item === 'string' ? item : item.name;
                    const docPath = typeof item === 'string' ? '' : (item.path || '');

                    if (!docName) continue;

                    // Check if document already exists for this employee
                    const existingDoc = await employeeDocRepo.findOne({
                        where: {
                            id_employee: employee.id_employee,
                            document_type: docName
                        }
                    });

                    if (!existingDoc) {
                        const newDoc = new EmployeeDocumentEntity();
                        newDoc.id_employee = employee.id_employee;
                        newDoc.document_type = docName;
                        newDoc.document_path = docPath; // Use the template path if available
                        newDoc.upload_date = new Date();
                        await employeeDocRepo.save(newDoc);
                        console.log(`Created document '${docName}' for employee ${employee.name_employee} (Path: ${docPath})`);
                    } else if (existingDoc.document_path === '' && docPath !== '') {
                        // Optional: Update existing document with template path if it was empty?
                        // For now, let's just leave it to avoid overwriting user uploads.
                        // But if it's empty, it means no file is there, so we could update it.
                        existingDoc.document_path = docPath;
                        await employeeDocRepo.save(existingDoc);
                        console.log(`Updated document '${docName}' with template path for employee ${employee.name_employee}`);
                    }
                }
            }

        } catch (error) {
            console.error("Error propagating documents to employees:", error);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await this.adapter.delete(Number(id));
            if (!deleted) return res.status(404).json({ message: "Descripción de puesto no encontrada" });
            res.json({ message: "Descripción de puesto eliminada correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al eliminar descripción de puesto" });
        }
    }
}
