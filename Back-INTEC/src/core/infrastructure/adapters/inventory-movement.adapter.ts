import { Id, Query } from '../../domain/repository/inventory-movement.repository';
import { InventoryMovementRepository } from '../../domain/repository/inventory-movement.repository';
import { InventoryMovementEntity } from '../entity/inventory-movement.entity';
import { InventoryEntity } from '../entity/inventory.entity';
import database from '../../../config/db';
import { NotFound } from 'http-errors';

export class InventoryMovementAdapterRepository implements InventoryMovementRepository<InventoryMovementEntity> {
  async create(data: Partial<InventoryMovementEntity>, query?: Query): Promise<InventoryMovementEntity> {
    const inventoryRepository = database.getRepository(InventoryEntity);
    const movementRepository = database.getRepository(InventoryMovementEntity);

    const inventory = await inventoryRepository.findOne({ where: { id_inventory: data.id_inventory } });
    if (!inventory) throw new NotFound('No existe el artículo de inventario con el id proporcionado');

    const delta = data.movement_type === 'Entrada'
      ? (data.quantity ?? 0)
      : -(data.quantity ?? 0);

    await inventoryRepository.update(
      { id_inventory: data.id_inventory },
      { quantity: inventory.quantity + delta }
    );

    const item = movementRepository.create({ ...data });
    await movementRepository.save(item);
    return movementRepository.findOneOrFail({ where: { id_movement: item.id_movement } });
  }

  async list(query?: Query): Promise<InventoryMovementEntity[]> {
    const repository = database.getRepository(InventoryMovementEntity);
    return repository.find({ order: { created_at: 'DESC' } });
  }

  async listByInventory(id_inventory: string, query?: Query): Promise<InventoryMovementEntity[]> {
    const repository = database.getRepository(InventoryMovementEntity);
    return repository.find({
      where: { id_inventory },
      order: { created_at: 'DESC' },
    });
  }

  async get(id: Id, query?: Query): Promise<InventoryMovementEntity> {
    const repository = database.getRepository(InventoryMovementEntity);
    const item = await repository.findOne({ where: { id_movement: id as number } });
    if (!item) throw new NotFound('No existe el movimiento con el id proporcionado');
    return item;
  }
}
