import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { SubcategoriesRepository } from '../../../domain/repository/subcategories.repository';
import { SubcategoriesEntity } from '../../entity/subCategories.entity';



config();

export class SubcategoriesController {
  constructor(private subcategoriesRepository: SubcategoriesRepository<SubcategoriesEntity>) {}

  

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const material = await this.subcategoriesRepository.create(body);
      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
      console.error(error)
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const materials = await this.subcategoriesRepository.list();
      res.status(200).json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar las sucategorias', error });
      console.error(error)
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.subcategoriesRepository.get(id);
      res.status(200).json(material);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la sucategoria', error });
    }
  }

   async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      const material = await this.subcategoriesRepository.update(String(id), body);
      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la subpartida', error });
      console.error(error)
      
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.subcategoriesRepository.remove(String(id));
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

      await this.subcategoriesRepository.syncToFirebase();

      const repository = database.getRepository(SubcategoriesEntity);
      const count = await repository.count();

      res.status(200).json({ 
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }
 

}