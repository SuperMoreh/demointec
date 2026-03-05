import { Request, Response } from 'express';
import { InventoryUniformRepository } from '../../../domain/repository/inventory-uniform.repository';
import { InventoryUniformEntity } from '../../entity/inventory-uniform.entity';

export class InventoryUniformController {
  constructor(private uniformRepository: InventoryUniformRepository<InventoryUniformEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      await this.uniformRepository.create(req.body);
      res.status(200).json({ message: 'Detalle de uniforme creado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el detalle de uniforme', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.uniformRepository.list();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar uniformes', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.uniformRepository.get(Number(id));
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el detalle de uniforme', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.uniformRepository.update(Number(id), req.body);
      res.status(200).json({ message: 'Detalle de uniforme actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el detalle de uniforme', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.uniformRepository.remove(Number(id));
      res.status(200).json({ message: 'Detalle de uniforme eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el detalle de uniforme', error });
    }
  }
}
