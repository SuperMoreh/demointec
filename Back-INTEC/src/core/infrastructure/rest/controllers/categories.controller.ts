import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { CategoriesRepository } from '../../../domain/repository/categories.repository';
import { CategoriesEntity } from '../../entity/categories.entity';



config();

export class CategoriesController {
  constructor(private mainCategoriesRepository: CategoriesRepository<CategoriesEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const categorie = await this.mainCategoriesRepository.create(body);
      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
      console.error(error)
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.mainCategoriesRepository.list();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar las partidas', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categorie = await this.mainCategoriesRepository.get(id);
      res.status(200).json(categorie);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la partida', error });
    }
  }

   async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      const categorie = await this.mainCategoriesRepository.update(String(id), body);
      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la partida', error });
      console.error(error)
      
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categorie = await this.mainCategoriesRepository.remove(String(id));
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

      await this.mainCategoriesRepository.syncToFirebase();

      const repository = database.getRepository(CategoriesEntity);
      const count = await repository.count();

      res.status(200).json({ 
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }
 

}