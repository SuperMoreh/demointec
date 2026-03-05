import { Request, Response } from 'express';
import { InventoryExtintorRepository } from '../../../domain/repository/inventory-extintor.repository';
import { InventoryExtintorEntity } from '../../entity/inventory-extintor.entity';

export class InventoryExtintorController {
  constructor(private extintorRepository: InventoryExtintorRepository<InventoryExtintorEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      await this.extintorRepository.create(req.body);
      res.status(200).json({ message: 'Extintor creado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el extintor', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.extintorRepository.list();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar extintores', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.extintorRepository.get(Number(id));
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el extintor', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.extintorRepository.update(Number(id), req.body);
      res.status(200).json({ message: 'Extintor actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el extintor', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.extintorRepository.remove(Number(id));
      res.status(200).json({ message: 'Extintor eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el extintor', error });
    }
  }
}
