import { Router } from "express";
import { SubcategoriesController } from "../controllers/subcategories.controller";
import { SubcategoriesAdapterRepository } from "../../adapters/subcategories.adapter";

const subcategoriesRouter = Router();

const controller = new SubcategoriesController(new SubcategoriesAdapterRepository);

subcategoriesRouter.post("/sincronizar-subpartidas", controller.syncToFirebase.bind(controller));
subcategoriesRouter.post("/subpartidas", controller.create.bind(controller));
subcategoriesRouter.get("/subpartidas", controller.list.bind(controller));
subcategoriesRouter.get("/subpartidas/:id", controller.get.bind(controller));
subcategoriesRouter.put("/subpartidas/:id", controller.update.bind(controller));
subcategoriesRouter.delete("/subpartidas/:id", controller.remove.bind(controller));

export default subcategoriesRouter;