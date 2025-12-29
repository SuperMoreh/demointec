import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { ToolsRepository } from '../../../domain/repository/tools_catalog.repository';
import { ToolsEntity } from '../../entity/tools_catalog.entity';



config();

export class ToolsController {
  constructor(private toolsRepository: ToolsRepository<ToolsEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const tool = await this.toolsRepository.create(body);
      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const tools = await this.toolsRepository.list();
      res.status(200).json(tools);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar las herramientas', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tool = await this.toolsRepository.get(id);
      res.status(200).json(tool);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la herramienta', error });
    }
  }

   async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      const tool = await this.toolsRepository.update(String(id), body);
      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la herramienta', error });
      console.error(error)
      
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tool = await this.toolsRepository.remove(String(id));
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

      await this.toolsRepository.syncToFirebase();

      const repository = database.getRepository(ToolsEntity);
      const count = await repository.count();

      res.status(200).json({ 
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }
 

}