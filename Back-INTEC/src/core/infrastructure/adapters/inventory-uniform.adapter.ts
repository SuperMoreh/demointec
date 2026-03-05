import { Id, Query } from '../../domain/repository/inventory-uniform.repository';
import { InventoryUniformRepository } from '../../domain/repository/inventory-uniform.repository';
import { InventoryUniformEntity } from '../entity/inventory-uniform.entity';
import database from '../../../config/db';
import { NotFound } from 'http-errors';

export class InventoryUniformAdapterRepository implements InventoryUniformRepository<InventoryUniformEntity> {
  async create(data: Partial<InventoryUniformEntity>, query?: Query): Promise<InventoryUniformEntity> {
    const repository = database.getRepository(InventoryUniformEntity);
    const item = repository.create({ ...data });
    await repository.save(item);
    return repository.findOneOrFail({ where: { id_inventory_uniform: item.id_inventory_uniform } });
  }

  async list(query?: Query): Promise<InventoryUniformEntity[]> {
    const repository = database.getRepository(InventoryUniformEntity);
    return repository.find({ where: { status: true } });
  }

  async get(id: Id, query?: Query): Promise<InventoryUniformEntity> {
    const repository = database.getRepository(InventoryUniformEntity);
    const item = await repository.findOne({ where: { id_inventory_uniform: id as number } });
    if (!item) throw new NotFound('No existe el detalle de uniforme con el id proporcionado');
    return item;
  }

  async update(id: Id, data: Partial<InventoryUniformEntity>, query?: Query): Promise<InventoryUniformEntity> {
    const repository = database.getRepository(InventoryUniformEntity);
    await repository.update({ id_inventory_uniform: id as number }, data);
    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<InventoryUniformEntity> {
    const repository = database.getRepository(InventoryUniformEntity);
    const item = await this.get(id);
    await repository.update({ id_inventory_uniform: id as number }, { status: false });
    return item;
  }
}
