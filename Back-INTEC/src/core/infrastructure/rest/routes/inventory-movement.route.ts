import { Router } from 'express';
import { InventoryMovementController } from '../controllers/inventory-movement.controller';
import { InventoryMovementAdapterRepository } from '../../adapters/inventory-movement.adapter';

const inventoryMovementRouter = Router();
const controller = new InventoryMovementController(new InventoryMovementAdapterRepository());

inventoryMovementRouter.post('/inventario-rh-movimientos', controller.create.bind(controller));
inventoryMovementRouter.get('/inventario-rh-movimientos', controller.list.bind(controller));
inventoryMovementRouter.get('/inventario-rh-movimientos/articulo/:id_inventory', controller.listByInventory.bind(controller));
inventoryMovementRouter.get('/inventario-rh-movimientos/:id', controller.get.bind(controller));

export default inventoryMovementRouter;
