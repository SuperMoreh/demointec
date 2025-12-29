import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { RequestHeadersRepository } from '../../../domain/repository/request_headers.repository';
import { RequestHeadersEntity } from '../../entity/request_headers.entity';


config();

export class RequestHeadersController {
  constructor(private requestRepository: RequestHeadersRepository<RequestHeadersEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const material = await this.requestRepository.create(body);
      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
      console.error(error)
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const materials = await this.requestRepository.list();
      res.status(200).json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar a las solicitudes', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.requestRepository.get(id);
      res.status(200).json(material);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la solicitud', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      if (!Array.isArray(body)) {
        throw new TypeError('El cuerpo de la solicitud debe ser un arreglo de materiales');
      }

      const materials = await this.requestRepository.update(body);

      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar la solicitud', error });
    }
  }



  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.requestRepository.remove(String(id));
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

      await this.requestRepository.syncToFirebase();

      const repository = database.getRepository(RequestHeadersEntity);
      const count = await repository.count();

      res.status(200).json({ 
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }
 

}