import { Router } from "express";
import { EmployeesController } from "../controllers/employees.controller";
import { EmployeesAdapterRepository } from "../../adapters/employees.adapter";


const employeesRouter = Router();

const controller = new EmployeesController(new EmployeesAdapterRepository);

employeesRouter.post("/sincronizar-colaboradores", controller.syncToFirebase.bind(controller));
employeesRouter.post("/colaboradores", controller.create.bind(controller));
employeesRouter.get("/colaboradores", controller.list.bind(controller));
employeesRouter.get("/colaboradores/:id", controller.get.bind(controller));
employeesRouter.put("/colaboradores/:id", controller.update.bind(controller));
employeesRouter.delete("/colaboradores/:id", controller.remove.bind(controller));
employeesRouter.get("/contracts-expiring", controller.getExpiringContracts.bind(controller));


export default employeesRouter;