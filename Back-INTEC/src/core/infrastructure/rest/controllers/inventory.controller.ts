import { Request, Response } from 'express';
import { InventoryRepository } from '../../../domain/repository/inventory.repository';
import { InventoryEntity } from '../../entity/inventory.entity';

export class InventoryController {
  constructor(private inventoryRepository: InventoryRepository<InventoryEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      await this.inventoryRepository.create(req.body);
      res.status(200).json({ message: 'Artículo creado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el artículo', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.inventoryRepository.list();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar el inventario', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.inventoryRepository.get(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el artículo', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.inventoryRepository.update(id, req.body);
      res.status(200).json({ message: 'Artículo actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el artículo', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.inventoryRepository.remove(id);
      res.status(200).json({ message: 'Artículo eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el artículo', error });
    }
  }
}
