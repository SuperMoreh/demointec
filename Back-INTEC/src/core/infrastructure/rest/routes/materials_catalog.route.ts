import { Router } from "express";
import { MaterialsController } from "../controllers/materials_catalog.controller";
import { MaterialsAdapterRepository } from "../../adapters/materials_catalog.adapter";


const materialsRouter = Router();

const controller = new MaterialsController(new MaterialsAdapterRepository);

materialsRouter.post("/sincronizar-materiales", controller.syncToFirebase.bind(controller));
materialsRouter.post("/materiales", controller.create.bind(controller));
materialsRouter.get("/materiales", controller.list.bind(controller));
materialsRouter.get("/materiales/:id", controller.get.bind(controller));
materialsRouter.put("/materiales/:id", controller.update.bind(controller));
materialsRouter.delete("/materiales/:id", controller.remove.bind(controller));


export default materialsRouter;