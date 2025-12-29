import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { EmployeesRepository } from '../../../domain/repository/employees.repository';
import { EmployeeEntity } from '../../entity/employees.entity';
import { LaborEventEntity } from '../../entity/labor-event.entity';
import { JobDescriptionEntity } from '../../entity/job-description.entity';
import { EmployeeDocumentEntity } from '../../entity/employee-documents.entity';


config();

export class EmployeesController {
  constructor(private employeesRepository: EmployeesRepository<EmployeeEntity>) { }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const material = await this.employeesRepository.create(body);

      // Create Labor Event for initial position if exists
      if (body.position) {
        try {
          const laborEventRepo = database.getRepository(LaborEventEntity);
          const newEvent = new LaborEventEntity();
          newEvent.id_employee = body.id_employee;
          newEvent.event_date = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD
          newEvent.event_name = 'Asignación de Puesto Inicial';
          newEvent.observation = `Se asignó el puesto: ${body.position}`;
          await laborEventRepo.save(newEvent);
        } catch (eventError) {
          console.error('Error creating labor event:', eventError);
        }

        // Sync Job Documents for initial position
        await this.syncJobDocuments(body.id_employee, body.position);
      }

      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const materials = await this.employeesRepository.list();
      res.status(200).json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar a los colaboradores', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.employeesRepository.get(id);
      res.status(200).json(material);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener al colaborador', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;

      // Get existing employee to check for position change
      const existingEmployee = await this.employeesRepository.get(String(id));

      // Check for Rehire to update status
      if (body.rehire_date && existingEmployee && body.rehire_date !== existingEmployee.rehire_date) {
        body.status = true;
      }

      // Extract non-entity fields to prevent SQL errors during update
      const { rehire_document_path, rehire_document_name, ...updateData } = body;

      const material = await this.employeesRepository.update(String(id), updateData);

      // Check if position changed
      if (existingEmployee && body.position && existingEmployee.position !== body.position) {
        try {
          const laborEventRepo = database.getRepository(LaborEventEntity);
          const newEvent = new LaborEventEntity();
          newEvent.id_employee = String(id);
          newEvent.event_date = new Date().toISOString().split('T')[0];
          newEvent.event_name = 'Cambio de Puesto';
          newEvent.observation = `Cambio de puesto de ${existingEmployee.position || 'Sin puesto'} a ${body.position}`;
          await laborEventRepo.save(newEvent);
        } catch (eventError) {
          console.error('Error creating labor event for position change:', eventError);
        }

        // Sync Job Documents for new position
        if (body.position) {
          await this.syncJobDocuments(String(id), body.position);
        }
      }

      // Check for Rehire (Reingreso)
      if (body.rehire_date && body.rehire_date !== existingEmployee?.rehire_date) {
        try {
          const laborEventRepo = database.getRepository(LaborEventEntity);
          const newEvent = new LaborEventEntity();
          newEvent.id_employee = String(id);
          newEvent.event_date = body.rehire_date;
          newEvent.event_name = 'Reingreso';
          newEvent.observation = 'Reingreso de colaborador';
          newEvent.document_path = body.rehire_document_path || '';
          await laborEventRepo.save(newEvent);

          // Save document to repository if provided
          if (body.rehire_document_path && body.rehire_document_name) {
            const docRepo = database.getRepository(EmployeeDocumentEntity);
            const newDoc = new EmployeeDocumentEntity();
            newDoc.id_employee = String(id);
            newDoc.document_type = body.rehire_document_name;
            newDoc.document_path = body.rehire_document_path;
            newDoc.upload_date = new Date();
            await docRepo.save(newDoc);
          }

          // Ensure status is active on rehire
          // We can optionally force status=true here if not already set in body

        } catch (eventError) {
          console.error('Error creating rehire event:', eventError);
        }
      }

      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar al colaborador', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.employeesRepository.remove(String(id));
      res.status(200).json({ message: 'Eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar', error });
    }
  }

  async syncToFirebase(req: Request, res: Response): Promise<void> {
    try {
      try {
        await db.ref().child('test').once('value');
      } catch {
        res.status(500).json({ message: 'Error al conectar con Firebase' });
        return;
      }

      await this.employeesRepository.syncToFirebase();

      const repository = database.getRepository(EmployeeEntity);
      const count = await repository.count();

      res.status(200).json({
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }


  private async syncJobDocuments(employeeId: string, position: string) {
    try {
      console.log(`[syncJobDocuments] START: Employee=${employeeId}, Position='${position}'`);
      const jobRepo = database.getRepository(JobDescriptionEntity);

      // Try to find the job description. Log what we are searching for.
      // Note: loosen the status check or log if it fails due to status
      const job = await jobRepo.findOne({ where: { job_title: position } }); // Removed status check for debugging

      if (!job) {
        console.warn(`[syncJobDocuments] Job Description NOT FOUND for position: '${position}'`);
        return;
      }

      console.log(`[syncJobDocuments] Found Job: ID=${job.id}, Status=${job.status}, Docs=${job.required_documents}`);

      if (!job.status) {
        console.warn(`[syncJobDocuments] Job found but is INACTIVE (status=${job.status}). Skipping sync.`);
        // Uncomment return if we strictly want to ignore inactive jobs
        // return; 
      }

      if (job && job.required_documents) {
        let requiredDocs: any[] = [];
        try {
          requiredDocs = JSON.parse(job.required_documents);
        } catch (e) {
          console.error('[syncJobDocuments] Error parsing required docs JSON', e);
          return;
        }

        if (!Array.isArray(requiredDocs)) {
          console.warn('[syncJobDocuments] required_documents is NOT an array');
          return;
        }

        console.log(`[syncJobDocuments] Processing ${requiredDocs.length} documents...`);

        const docRepo = database.getRepository(EmployeeDocumentEntity);

        for (const item of requiredDocs) {
          const docName = typeof item === 'string' ? item : item.name;
          const docPath = typeof item === 'string' ? '' : (item.path || '');

          if (!docName) continue;

          console.log(`[syncJobDocuments] Checking doc: '${docName}'`);

          const existingDoc = await docRepo.findOne({
            where: { id_employee: employeeId, document_type: docName }
          });

          if (!existingDoc) {
            const newDoc = new EmployeeDocumentEntity();
            newDoc.id_employee = employeeId;
            newDoc.document_type = docName;
            newDoc.document_path = docPath;
            newDoc.upload_date = new Date();
            await docRepo.save(newDoc);
            console.log(`[syncJobDocuments] CREATED document '${docName}' for employee ${employeeId}`);
          } else {
            console.log(`[syncJobDocuments] Document '${docName}' already exists.`);
            if (existingDoc.document_path === '' && docPath !== '') {
              existingDoc.document_path = docPath;
              await docRepo.save(existingDoc);
              console.log(`[syncJobDocuments] UPDATED document '${docName}' with template path`);
            }
          }
        }
      } else {
        console.log('[syncJobDocuments] Job description has NO documents configured.');
      }
    } catch (error) {
      console.error('[syncJobDocuments] FATAL ERROR:', error);
    }
  }

}