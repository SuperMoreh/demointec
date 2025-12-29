import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { MateralsRepository } from '../../../domain/repository/materials_catalog.repository';
import { MaterialEntity } from '../../entity/materials_catalog.entity';


config();

export class MaterialsController {
  constructor(private materialsRepository: MateralsRepository<MaterialEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const material = await this.materialsRepository.create(body);
      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const materials = await this.materialsRepository.list();
      res.status(200).json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar el material', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.materialsRepository.get(id);
      res.status(200).json(material);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el material', error });
    }
  }

   async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      const material = await this.materialsRepository.update(String(id), body);
      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el material', error });
      console.error(error)
      
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.materialsRepository.remove(String(id));
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

      await this.materialsRepository.syncToFirebase();

      const repository = database.getRepository(MaterialEntity);
      const count = await repository.count();

      res.status(200).json({ 
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }
 

}