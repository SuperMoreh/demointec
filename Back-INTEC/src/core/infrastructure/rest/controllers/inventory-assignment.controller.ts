import { Request, Response } from 'express';
import { InventoryAssignmentRepository } from '../../../domain/repository/inventory-assignment.repository';
import { InventoryAssignmentEntity } from '../../entity/inventory-assignment.entity';

export class InventoryAssignmentController {
  constructor(private assignmentRepository: InventoryAssignmentRepository<InventoryAssignmentEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      await this.assignmentRepository.create(req.body);
      res.status(200).json({ message: 'Asignación creada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear la asignación', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.assignmentRepository.list();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar asignaciones', error });
    }
  }

  async listByInventory(req: Request, res: Response): Promise<void> {
    try {
      const { id_inventory } = req.params;
      const items = await this.assignmentRepository.listByInventory(id_inventory);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar asignaciones del artículo', error });
    }
  }

  async listByEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { id_employee } = req.params;
      const items = await this.assignmentRepository.listByEmployee(id_employee);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar asignaciones del colaborador', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.assignmentRepository.get(Number(id));
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la asignación', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.assignmentRepository.update(Number(id), req.body);
      res.status(200).json({ message: 'Asignación actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la asignación', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.assignmentRepository.remove(Number(id));
      res.status(200).json({ message: 'Asignación eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la asignación', error });
    }
  }
}
