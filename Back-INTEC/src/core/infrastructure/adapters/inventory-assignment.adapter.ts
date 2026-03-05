import { Id, Query } from '../../domain/repository/inventory-assignment.repository';
import { InventoryAssignmentRepository } from '../../domain/repository/inventory-assignment.repository';
import { InventoryAssignmentEntity } from '../entity/inventory-assignment.entity';
import { InventoryEntity } from '../entity/inventory.entity';
import database from '../../../config/db';
import { NotFound } from 'http-errors';

export class InventoryAssignmentAdapterRepository implements InventoryAssignmentRepository<InventoryAssignmentEntity> {
  async create(data: Partial<InventoryAssignmentEntity>, query?: Query): Promise<InventoryAssignmentEntity> {
    const assignmentRepo = database.getRepository(InventoryAssignmentEntity);
    const inventoryRepo = database.getRepository(InventoryEntity);

    const quantity = data.quantity ?? 1;

    const inventory = await inventoryRepo.findOne({ where: { id_inventory: data.id_inventory } });
    if (inventory) {
      await inventoryRepo.update({ id_inventory: data.id_inventory }, { quantity: Math.max(0, inventory.quantity - quantity) });
    }

    const item = assignmentRepo.create({ ...data });
    await assignmentRepo.save(item);
    return assignmentRepo.findOneOrFail({ where: { id_assignment: item.id_assignment } });
  }

  async list(query?: Query): Promise<InventoryAssignmentEntity[]> {
    const repository = database.getRepository(InventoryAssignmentEntity);
    return repository.find({ where: { status: true }, order: { assignment_date: 'DESC' } });
  }

  async listByInventory(id_inventory: string, query?: Query): Promise<InventoryAssignmentEntity[]> {
    const repository = database.getRepository(InventoryAssignmentEntity);
    return repository.find({
      where: { id_inventory, status: true },
      order: { assignment_date: 'DESC' },
    });
  }

  async listByEmployee(id_employee: string, query?: Query): Promise<InventoryAssignmentEntity[]> {
    const repository = database.getRepository(InventoryAssignmentEntity);
    return repository.find({
      where: { id_employee, status: true },
      order: { assignment_date: 'DESC' },
    });
  }

  async get(id: Id, query?: Query): Promise<InventoryAssignmentEntity> {
    const repository = database.getRepository(InventoryAssignmentEntity);
    const item = await repository.findOne({ where: { id_assignment: id as number } });
    if (!item) throw new NotFound('No existe la asignación con el id proporcionado');
    return item;
  }

  async update(id: Id, data: Partial<InventoryAssignmentEntity>, query?: Query): Promise<InventoryAssignmentEntity> {
    const assignmentRepo = database.getRepository(InventoryAssignmentEntity);
    const inventoryRepo = database.getRepository(InventoryEntity);

    const current = await this.get(id);
    const wasReturned = current.state === 'Devuelto';
    const isNowReturned = data.state === 'Devuelto';
    const newQuantity = data.quantity ?? current.quantity;
    const oldQuantity = current.quantity;

    const inventory = await inventoryRepo.findOne({ where: { id_inventory: current.id_inventory } });
    if (inventory) {
      let delta = 0;
      if (!wasReturned && isNowReturned) {
        // Artículo devuelto: regresar cantidad al inventario
        delta = oldQuantity;
      } else if (!wasReturned && !isNowReturned) {
        // Solo cambió la cantidad asignada: ajustar diferencia
        delta = oldQuantity - newQuantity;
      }
      if (delta !== 0) {
        await inventoryRepo.update({ id_inventory: current.id_inventory }, { quantity: Math.max(0, inventory.quantity + delta) });
      }
    }

    await assignmentRepo.update({ id_assignment: id as number }, data);
    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<InventoryAssignmentEntity> {
    const assignmentRepo = database.getRepository(InventoryAssignmentEntity);
    const inventoryRepo = database.getRepository(InventoryEntity);

    const item = await this.get(id);

    // Si el artículo no fue devuelto, regresar la cantidad al inventario
    if (item.state !== 'Devuelto') {
      const inventory = await inventoryRepo.findOne({ where: { id_inventory: item.id_inventory } });
      if (inventory) {
        await inventoryRepo.update({ id_inventory: item.id_inventory }, { quantity: inventory.quantity + item.quantity });
      }
    }

    await assignmentRepo.update({ id_assignment: id as number }, { status: false });
    return item;
  }
}
