import { config } from 'dotenv';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { RequestDetailsRepository } from '../../../domain/repository/request_details.repository';
import { RequestDetailsEntity } from '../../entity/request_details.entity';



config();

export class RequestDetailsController {
  constructor(private requestRepository: RequestDetailsRepository<RequestDetailsEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const material = await this.requestRepository.create(body);
      res.status(200).json();
    } catch (error) {
      res.status(500).json({ message: 'Error', error })
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
      const { id: idDetailFromUrl } = req.params;

      if (!Array.isArray(body)) {
        throw new TypeError('El cuerpo de la solicitud debe ser un arreglo de materiales');
      }

      for (const item of body) {
        if (!item.id) {
          throw new Error('Cada material debe tener su id');
        }
        if (!item.id_detail) {
          throw new Error('Cada material debe tener su id_detail');
        }
        if (item.id_detail !== idDetailFromUrl) {
          throw new Error(`El id_detail del elemento (${item.id_detail}) no coincide con el de la URL (${idDetailFromUrl})`);
        }
      }

      const materials = await this.requestRepository.update(body);

      res.status(200).json(materials);
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ message: 'Error al actualizar la solicitud', error: error instanceof Error ? error.message : String(error) });
    }
  }



  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.requestRepository.remove(String(id));
      res.status(200).json();
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

      const repository = database.getRepository(RequestDetailsEntity);
      const count = await repository.count();

      res.status(200).json({ 
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }

  async getCurrentFolio(req: Request, res: Response): Promise<void> {
    try {
      const folio = await this.requestRepository.getCurrentFolio();
      console.log (folio)
      res.status(200).json({ folio });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el folio actual', error });
    }
  }
 

}