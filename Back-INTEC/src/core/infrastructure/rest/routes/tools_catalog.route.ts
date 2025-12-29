import { Router } from "express";
import { ToolsController } from "../controllers/tools_catalog.controller";
import { ToolsAdapterRepository } from "../../adapters/tools_catalog.adapter";

const toolsRouter = Router();

const controller = new ToolsController(new ToolsAdapterRepository);

toolsRouter.post("/sincronizar-herramientas", controller.syncToFirebase.bind(controller));
toolsRouter.post("/herramientas", controller.create.bind(controller));
toolsRouter.get("/herramientas", controller.list.bind(controller));
toolsRouter.get("/herramientas/:id", controller.get.bind(controller));
toolsRouter.put("/herramientas/:id", controller.update.bind(controller));
toolsRouter.delete("/herramientas/:id", controller.remove.bind(controller));


export default toolsRouter;