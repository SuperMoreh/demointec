import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { InventoryAdapterRepository } from '../../adapters/inventory.adapter';

const inventoryRouter = Router();
const controller = new InventoryController(new InventoryAdapterRepository());

inventoryRouter.post('/inventario-rh', controller.create.bind(controller));
inventoryRouter.get('/inventario-rh', controller.list.bind(controller));
inventoryRouter.get('/inventario-rh/:id', controller.get.bind(controller));
inventoryRouter.put('/inventario-rh/:id', controller.update.bind(controller));
inventoryRouter.delete('/inventario-rh/:id', controller.remove.bind(controller));

export default inventoryRouter;
