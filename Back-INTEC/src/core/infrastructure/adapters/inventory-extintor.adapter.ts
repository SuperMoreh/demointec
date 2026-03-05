import { Id, Query } from '../../domain/repository/inventory-extintor.repository';
import { InventoryExtintorRepository } from '../../domain/repository/inventory-extintor.repository';
import { InventoryExtintorEntity } from '../entity/inventory-extintor.entity';
import database from '../../../config/db';
import { NotFound } from 'http-errors';

export class InventoryExtintorAdapterRepository implements InventoryExtintorRepository<InventoryExtintorEntity> {
  async create(data: Partial<InventoryExtintorEntity>, query?: Query): Promise<InventoryExtintorEntity> {
    const repository = database.getRepository(InventoryExtintorEntity);
    const item = repository.create({ ...data });
    await repository.save(item);
    return repository.findOneOrFail({ where: { id_inventory_extintor: item.id_inventory_extintor } });
  }

  async list(query?: Query): Promise<InventoryExtintorEntity[]> {
    const repository = database.getRepository(InventoryExtintorEntity);
    return repository.find({ where: { status: true } });
  }

  async get(id: Id, query?: Query): Promise<InventoryExtintorEntity> {
    const repository = database.getRepository(InventoryExtintorEntity);
    const item = await repository.findOne({ where: { id_inventory_extintor: id as number } });
    if (!item) throw new NotFound('No existe el extintor con el id proporcionado');
    return item;
  }

  async update(id: Id, data: Partial<InventoryExtintorEntity>, query?: Query): Promise<InventoryExtintorEntity> {
    const repository = database.getRepository(InventoryExtintorEntity);
    await repository.update({ id_inventory_extintor: id as number }, data);
    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<InventoryExtintorEntity> {
    const repository = database.getRepository(InventoryExtintorEntity);
    const item = await this.get(id);
    await repository.update({ id_inventory_extintor: id as number }, { status: false });
    return item;
  }
}
