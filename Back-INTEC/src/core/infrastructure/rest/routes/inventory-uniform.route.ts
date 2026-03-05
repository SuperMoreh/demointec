import { Router } from 'express';
import { InventoryUniformController } from '../controllers/inventory-uniform.controller';
import { InventoryUniformAdapterRepository } from '../../adapters/inventory-uniform.adapter';

const inventoryUniformRouter = Router();
const controller = new InventoryUniformController(new InventoryUniformAdapterRepository());

inventoryUniformRouter.post('/inventario-rh-uniformes', controller.create.bind(controller));
inventoryUniformRouter.get('/inventario-rh-uniformes', controller.list.bind(controller));
inventoryUniformRouter.get('/inventario-rh-uniformes/:id', controller.get.bind(controller));
inventoryUniformRouter.put('/inventario-rh-uniformes/:id', controller.update.bind(controller));
inventoryUniformRouter.delete('/inventario-rh-uniformes/:id', controller.remove.bind(controller));

export default inventoryUniformRouter;
