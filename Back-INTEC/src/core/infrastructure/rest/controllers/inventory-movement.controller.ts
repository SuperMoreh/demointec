import { Request, Response } from 'express';
import { InventoryMovementRepository } from '../../../domain/repository/inventory-movement.repository';
import { InventoryMovementEntity } from '../../entity/inventory-movement.entity';

export class InventoryMovementController {
  constructor(private movementRepository: InventoryMovementRepository<InventoryMovementEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      await this.movementRepository.create(req.body);
      res.status(200).json({ message: 'Movimiento registrado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar el movimiento', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.movementRepository.list();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar movimientos', error });
    }
  }

  async listByInventory(req: Request, res: Response): Promise<void> {
    try {
      const { id_inventory } = req.params;
      const items = await this.movementRepository.listByInventory(id_inventory);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar movimientos del artículo', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.movementRepository.get(Number(id));
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el movimiento', error });
    }
  }
}
