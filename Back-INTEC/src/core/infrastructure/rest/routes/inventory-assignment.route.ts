import { Router } from 'express';
import { InventoryAssignmentController } from '../controllers/inventory-assignment.controller';
import { InventoryAssignmentAdapterRepository } from '../../adapters/inventory-assignment.adapter';

const inventoryAssignmentRouter = Router();
const controller = new InventoryAssignmentController(new InventoryAssignmentAdapterRepository());

inventoryAssignmentRouter.post('/inventario-rh-asignaciones', controller.create.bind(controller));
inventoryAssignmentRouter.get('/inventario-rh-asignaciones', controller.list.bind(controller));
inventoryAssignmentRouter.get('/inventario-rh-asignaciones/articulo/:id_inventory', controller.listByInventory.bind(controller));
inventoryAssignmentRouter.get('/inventario-rh-asignaciones/colaborador/:id_employee', controller.listByEmployee.bind(controller));
inventoryAssignmentRouter.get('/inventario-rh-asignaciones/:id', controller.get.bind(controller));
inventoryAssignmentRouter.put('/inventario-rh-asignaciones/:id', controller.update.bind(controller));
inventoryAssignmentRouter.delete('/inventario-rh-asignaciones/:id', controller.remove.bind(controller));

export default inventoryAssignmentRouter;
