import { Router } from 'express';
import { InventoryExtintorController } from '../controllers/inventory-extintor.controller';
import { InventoryExtintorAdapterRepository } from '../../adapters/inventory-extintor.adapter';

const inventoryExtintorRouter = Router();
const controller = new InventoryExtintorController(new InventoryExtintorAdapterRepository());

inventoryExtintorRouter.post('/inventario-rh-extintores', controller.create.bind(controller));
inventoryExtintorRouter.get('/inventario-rh-extintores', controller.list.bind(controller));
inventoryExtintorRouter.get('/inventario-rh-extintores/:id', controller.get.bind(controller));
inventoryExtintorRouter.put('/inventario-rh-extintores/:id', controller.update.bind(controller));
inventoryExtintorRouter.delete('/inventario-rh-extintores/:id', controller.remove.bind(controller));

export default inventoryExtintorRouter;
