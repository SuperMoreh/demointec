import { Router } from "express";
import { EmployeeProjectController } from "../controllers/employee-project.controller";
import { EmployeeProjectAdapterRepository } from "../../adapters/employee-project.adapter";

const employeeProjectRouter = Router();

const controller = new EmployeeProjectController(new EmployeeProjectAdapterRepository);

employeeProjectRouter.get("/colaborador-obra", controller.list.bind(controller));
employeeProjectRouter.get("/colaborador-obra/:id", controller.get.bind(controller));
employeeProjectRouter.put("/colaborador-obra/:id", controller.update.bind(controller));
employeeProjectRouter.delete("/colaborador-obra/:id", controller.remove.bind(controller));

export default employeeProjectRouter;
