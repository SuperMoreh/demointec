import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { RoleAdapterRepository } from "../../adapters/roles.adapter";
import { RoleController } from "../controllers/roles.controller";

const roleRouter = Router();

const controller = new RoleController(new RoleAdapterRepository);

roleRouter.post("/roles", controller.create.bind(controller));
roleRouter.get("/roles", controller.list.bind(controller));
roleRouter.get("/roles/:id", controller.get.bind(controller));
roleRouter.put("/roles/:id", controller.update.bind(controller));
roleRouter.delete("/roles/:id", controller.remove.bind(controller));


export default roleRouter;