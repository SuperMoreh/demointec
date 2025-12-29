import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { ProjectsRepository } from '../../../domain/repository/projects_catalog.repository';
import { ProjectEntity } from '../../entity/projects_catalog.entity';



config();

export class ProjectsController {
  constructor(private projectRepository: ProjectsRepository<ProjectEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const project = await this.projectRepository.create(body);
      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.projectRepository.list();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los proyectos', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectRepository.get(id);
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el proyecto', error });
    }
  }

   async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      const project = await this.projectRepository.update(String(id), body);
      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el proyecto', error });
      console.error(error)
      
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectRepository.remove(String(id));
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

      await this.projectRepository.syncToFirebase();

      const repository = database.getRepository(ProjectEntity);
      const count = await repository.count();

      res.status(200).json({ 
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }
 

}