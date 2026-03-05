import { Id, Query } from '../../domain/repository/inventory.repository';
import { InventoryRepository } from '../../domain/repository/inventory.repository';
import { InventoryEntity } from '../entity/inventory.entity';
import database from '../../../config/db';
import { NotFound } from 'http-errors';

export class InventoryAdapterRepository implements InventoryRepository<InventoryEntity> {
  async create(data: Partial<InventoryEntity>, query?: Query): Promise<InventoryEntity> {
    const repository = database.getRepository(InventoryEntity);
    const item = repository.create({ ...data });
    await repository.save(item);
    return repository.findOneOrFail({ where: { id_inventory: data.id_inventory } });
  }

  async list(query?: Query): Promise<InventoryEntity[]> {
    const repository = database.getRepository(InventoryEntity);
    return repository.find({ where: { status: true } });
  }

  async get(id: Id, query?: Query): Promise<InventoryEntity> {
    const repository = database.getRepository(InventoryEntity);
    const item = await repository.findOne({ where: { id_inventory: id as string } });
    if (!item) throw new NotFound('No existe el artículo con el id proporcionado');
    return item;
  }

  async update(id: Id, data: Partial<InventoryEntity>, query?: Query): Promise<InventoryEntity> {
    const repository = database.getRepository(InventoryEntity);
    await repository.update({ id_inventory: id as string }, data);
    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<InventoryEntity> {
    const repository = database.getRepository(InventoryEntity);
    const item = await this.get(id);
    await repository.update({ id_inventory: id as string }, { status: false });
    return item;
  }
}
